import { ThemedText } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Custom Text Input Component
interface CustomTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  error?: string;
  maxLength?: number;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  keyboardType = 'default',
  multiline = false,
  error,
  maxLength,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {label}
          {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
        </ThemedText>
      </View>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textInputMultiline,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
      {error && (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </ThemedText>
      )}
      {maxLength && (
        <ThemedText style={[styles.characterCount, { color: colors.textSecondary }]}>
          {value.length}/{maxLength}
        </ThemedText>
      )}
    </View>
  );
};

// Custom Dropdown Component
interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  onSelect,
  options,
  placeholder = 'Select an option',
  required = false,
  error,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {label}
          {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
        </ThemedText>
      </View>
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
        onPress={() => setIsOpen(true)}
      >
        <ThemedText
          style={[
            styles.dropdownText,
            !selectedOption && { color: colors.inputPlaceholder },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.iconSecondary}
        />
      </TouchableOpacity>

      {error && (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </ThemedText>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: colors.background }]}>
            <View style={[styles.dropdownHeader, { borderBottomColor: colors.border }]}>
              <ThemedText style={styles.dropdownTitle}>{label}</ThemedText>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.dropdownOptions}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownOption,
                    { borderBottomColor: colors.border },
                    option.value === value && { backgroundColor: colors.surfaceVariant },
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.dropdownOptionText,
                      option.value === value && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {option.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// File Upload Component
interface FileUploadProps {
  label: string;
  value: string | null;
  onFileSelect: (uri: string | null) => void;
  required?: boolean;
  error?: string;
  acceptedFormats?: string[];
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value,
  onFileSelect,
  required = false,
  error,
  acceptedFormats = ['PDF', 'JPG', 'PNG'],
  maxSize = 5,
}) => {
  const { colors } = useTheme();

  const handleFileSelect = async () => {
    // This would integrate with expo-document-picker or similar
    // For now, we'll simulate file selection
    const mockFileUri = `file://mock-document-${Date.now()}.pdf`;
    onFileSelect(mockFileUri);
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <ThemedText style={styles.label}>
          {label}
          {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
        </ThemedText>
      </View>

      {!value ? (
        <TouchableOpacity
          style={[
            styles.fileUpload,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
            },
          ]}
          onPress={handleFileSelect}
        >
          <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
          <ThemedText style={[styles.fileUploadTitle, { color: colors.primary }]}>
            Upload File
          </ThemedText>
          <ThemedText style={[styles.fileUploadSubtitle, { color: colors.textSecondary }]}>
            Tap to browse files
          </ThemedText>
          <ThemedText style={[styles.fileUploadFormats, { color: colors.textTertiary }]}>
            Accepted: {acceptedFormats.join(', ')} • Max {maxSize}MB
          </ThemedText>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.fileUploaded,
            {
              backgroundColor: colors.surface,
              borderColor: colors.success,
            },
          ]}
        >
          <View style={styles.fileUploadedContent}>
            <Ionicons name="document" size={24} color={colors.success} />
            <View style={styles.fileUploadedText}>
              <ThemedText style={styles.fileUploadedName}>
                Document uploaded
              </ThemedText>
              <ThemedText style={[styles.fileUploadedSize, { color: colors.textSecondary }]}>
                {value.split('/').pop()?.substring(0, 30)}...
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={handleRemoveFile} style={styles.fileRemoveButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 52,
  },
  textInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 52,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownModal: {
    borderRadius: 16,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  dropdownOptions: {
    maxHeight: 300,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  dropdownOptionText: {
    fontSize: 16,
    flex: 1,
  },
  fileUpload: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  fileUploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  fileUploadSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  fileUploadFormats: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  fileUploaded: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileUploadedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileUploadedText: {
    marginLeft: 12,
    flex: 1,
  },
  fileUploadedName: {
    fontSize: 16,
    fontWeight: '600',
  },
  fileUploadedSize: {
    fontSize: 14,
    marginTop: 2,
  },
  fileRemoveButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 6,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});