import { ThemedText, ThemedView } from '@/components/themed-components';
import { PersonalInfo, useProfile } from '@/context/ProfileContext';

import { useTheme } from '@/hooks/use-theme';
import { UserDataManager } from '@/lib/userDataManager';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PersonalInformationScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { personalInfo, setPersonalInfo } = useProfile();
  
  const [localPersonalInfo, setLocalPersonalInfo] = useState<PersonalInfo>(personalInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when context changes
  useEffect(() => {
    setLocalPersonalInfo(personalInfo);
  }, [personalInfo]);

  const updateField = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLocalPersonalInfo(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setLocalPersonalInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await setPersonalInfo(localPersonalInfo);
      
      // Debug: Log storage stats after saving
      const stats = await UserDataManager.getStorageStats();
      console.log('Data saved successfully:', stats);
      
      Alert.alert(
        'Save Changes',
        'Your personal information has been updated successfully.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setIsEditing(false);
              setHasChanges(false);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Error',
        'Failed to save your information. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setLocalPersonalInfo(personalInfo); // Reset to saved values
              setIsEditing(false);
              setHasChanges(false);
            }
          }
        ]
      );
    } else {
      setIsEditing(false);
    }
  };



  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    keyboardType = 'default',
    multiline = false,
    editable = true
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
    multiline?: boolean;
    editable?: boolean;
  }) => (
    <View style={styles.inputGroup}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
            opacity: editable && isEditing ? 1 : 0.7
          },
          multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable && isEditing}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  const SwitchField = ({
    label,
    description,
    value,
    onValueChange
  }: {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.switchGroup}>
      <View style={styles.switchLabelContainer}>
        <ThemedText style={styles.switchLabel}>{label}</ThemedText>
        {description && (
          <ThemedText variant="secondary" style={styles.switchDescription}>
            {description}
          </ThemedText>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surface, true: colors.primary }}
        thumbColor={colors.background}
        disabled={!isEditing}
      />
    </View>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.section, { borderBottomColor: colors.border }]}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 16,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Personal Information</ThemedText>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={isEditing ? (hasChanges ? handleSave : handleCancel) : () => setIsEditing(true)}
            style={styles.actionButton}
          >
            <ThemedText style={[styles.actionButtonText, { 
              color: isEditing ? (hasChanges ? colors.primary : colors.text) : colors.primary 
            }]}>
              {isEditing ? (hasChanges ? 'Save' : 'Cancel') : 'Edit'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.content, 
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <Section title="Basic Information">
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="First Name"
                  value={localPersonalInfo.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  placeholder="Enter first name"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Last Name"
                  value={localPersonalInfo.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <InputField
              label="Email Address"
              value={localPersonalInfo.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="your.email@example.com"
              keyboardType="email-address"
            />

            <InputField
              label="Phone Number"
              value={localPersonalInfo.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="+27 81 234 5678"
              keyboardType="phone-pad"
            />

            <InputField
              label="Date of Birth"
              value={localPersonalInfo.dateOfBirth}
              onChangeText={(text) => updateField('dateOfBirth', text)}
              placeholder="DD/MM/YYYY"
            />

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Gender</ThemedText>
              <View style={styles.genderContainer}>
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      {
                        backgroundColor: localPersonalInfo.gender === option.value ? colors.primary : colors.surface,
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => isEditing && updateField('gender', option.value)}
                    disabled={!isEditing}
                  >
                    <ThemedText style={[
                      styles.genderText,
                      { color: localPersonalInfo.gender === option.value ? '#fff' : colors.text }
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <InputField
              label="Nationality"
              value={localPersonalInfo.nationality}
              onChangeText={(text) => updateField('nationality', text)}
              placeholder="South African"
            />

            <InputField
              label="ID Number"
              value={localPersonalInfo.idNumber}
              onChangeText={(text) => updateField('idNumber', text)}
              placeholder="Enter ID number"
              keyboardType="numeric"
            />
          </Section>

          {/* Address Information */}
          <Section title="Address Information">
            <InputField
              label="Street Address"
              value={localPersonalInfo.address.street}
              onChangeText={(text) => updateField('address.street', text)}
              placeholder="123 Main Street"
              multiline
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="City"
                  value={localPersonalInfo.address.city}
                  onChangeText={(text) => updateField('address.city', text)}
                  placeholder="Cape Town"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Province"
                  value={localPersonalInfo.address.province}
                  onChangeText={(text) => updateField('address.province', text)}
                  placeholder="Western Cape"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Postal Code"
                  value={localPersonalInfo.address.postalCode}
                  onChangeText={(text) => updateField('address.postalCode', text)}
                  placeholder="8001"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Country"
                  value={localPersonalInfo.address.country}
                  onChangeText={(text) => updateField('address.country', text)}
                  placeholder="South Africa"
                />
              </View>
            </View>
          </Section>

          {/* Emergency Contact */}
          <Section title="Emergency Contact">
            <InputField
              label="Full Name"
              value={localPersonalInfo.emergencyContact.name}
              onChangeText={(text) => updateField('emergencyContact.name', text)}
              placeholder="Emergency contact name"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Relationship"
                  value={localPersonalInfo.emergencyContact.relationship}
                  onChangeText={(text) => updateField('emergencyContact.relationship', text)}
                  placeholder="Parent, Sibling, etc."
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Phone Number"
                  value={localPersonalInfo.emergencyContact.phone}
                  onChangeText={(text) => updateField('emergencyContact.phone', text)}
                  placeholder="+27 81 234 5678"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </Section>

          {/* Academic Information */}
          <Section title="Academic Information">
            <InputField
              label="University/Institution"
              value={localPersonalInfo.university}
              onChangeText={(text) => updateField('university', text)}
              placeholder="University of Cape Town"
            />

            <InputField
              label="Student Number"
              value={localPersonalInfo.studentNumber}
              onChangeText={(text) => updateField('studentNumber', text)}
              placeholder="STDXXXXXXXXXXXX"
            />

            <InputField
              label="Course/Degree"
              value={localPersonalInfo.courseOfStudy}
              onChangeText={(text) => updateField('courseOfStudy', text)}
              placeholder="Bachelor of Commerce"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Year of Study"
                  value={localPersonalInfo.yearOfStudy}
                  onChangeText={(text) => updateField('yearOfStudy', text)}
                  placeholder="1st Year, 2nd Year, etc."
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Expected Graduation"
                  value={localPersonalInfo.graduationYear}
                  onChangeText={(text) => updateField('graduationYear', text)}
                  placeholder="2026"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Section>

          {/* Privacy & Notifications */}
          <Section title="Privacy & Notifications">
            <SwitchField
              label="Email Notifications"
              description="Receive updates about applications and property matches"
              value={localPersonalInfo.preferences.emailNotifications}
              onValueChange={(value) => updateField('preferences.emailNotifications', value)}
            />

            <SwitchField
              label="SMS Notifications"
              description="Receive urgent notifications via text message"
              value={localPersonalInfo.preferences.smsNotifications}
              onValueChange={(value) => updateField('preferences.smsNotifications', value)}
            />

            <SwitchField
              label="Marketing Emails"
              description="Receive promotional offers and property recommendations"
              value={localPersonalInfo.preferences.marketingEmails}
              onValueChange={(value) => updateField('preferences.marketingEmails', value)}
            />

            <SwitchField
              label="Profile Visibility"
              description="Allow property hosts to view your profile information"
              value={localPersonalInfo.preferences.profileVisible}
              onValueChange={(value) => updateField('preferences.profileVisible', value)}
            />
          </Section>

          {!isEditing && (
            <View style={styles.infoNote}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              <ThemedText variant="secondary" style={styles.infoText}>
                Keep your information up to date to help property hosts verify your applications and contact you easily.
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
    minWidth: 60,
    alignItems: 'center',
  },
  demoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 50,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});