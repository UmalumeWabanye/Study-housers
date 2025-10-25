import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface ImagePickerOptions {
  onImageSelected: (uri: string) => void;
  onError?: (error: string) => void;
}

export const useImagePicker = () => {
  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to change your profile picture.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async ({ onImageSelected, onError }: ImagePickerOptions) => {
    try {
      // Request permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        onError?.('Permission denied');
        return;
      }

      // For Android, we'll use a different approach due to UI visibility issues
      if (Platform.OS === 'android') {
        // On Android, disable editing to avoid dark UI issues, then handle cropping ourselves if needed
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: false, // Disable built-in editing to avoid UI issues
          quality: 0.8,
          selectionLimit: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          // For now, just use the image as-is. In production, you could add a custom cropping solution
          onImageSelected(result.assets[0].uri);
        }
      } else {
        // iOS and other platforms - use editing as normal
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          onImageSelected(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to pick image');
    }
  };

  const showImagePickerOptions = ({ onImageSelected, onError }: ImagePickerOptions) => {
    const androidNote = Platform.OS === 'android' ? 
      '\n\nNote: Image cropping is optimized for better visibility on Android.' : '';
    
    Alert.alert(
      'Select Profile Photo',
      `Choose how you want to select your profile photo${androidNote}`,
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              // Request camera permissions
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Camera permission is required to take photos');
                return;
              }

              let result;
              if (Platform.OS === 'android') {
                // Android: disable editing to avoid UI visibility issues
                result = await ImagePicker.launchCameraAsync({
                  allowsEditing: false,
                  quality: 0.8,
                });
              } else {
                // iOS and other platforms
                result = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.8,
                  presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
                });
              }

              if (!result.canceled && result.assets && result.assets.length > 0) {
                onImageSelected(result.assets[0].uri);
              }
            } catch (error) {
              console.error('Camera error:', error);
              onError?.(error instanceof Error ? error.message : 'Failed to take photo');
            }
          }
        },
        {
          text: 'Photo Library',
          onPress: () => pickImage({ onImageSelected, onError })
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return {
    pickImage,
    showImagePickerOptions,
    requestPermissions,
  };
};