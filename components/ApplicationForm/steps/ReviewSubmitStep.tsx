import { ThemedText } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useApplicationForm } from '../ApplicationFormContext';

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const ReviewSubmitStep: React.FC<Props> = ({ onNext }) => {
  const { colors } = useTheme();
  const { formData, setCurrentStep } = useApplicationForm();

  const handleEditSection = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.stepTitle}>
          Review & Submit
        </ThemedText>
        <ThemedText variant="secondary" style={styles.stepDescription}>
          Please review your information before submitting your application.
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Details Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Personal Details</ThemedText>
            <TouchableOpacity onPress={() => handleEditSection(1)} style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <ThemedText style={[styles.editText, { color: colors.primary }]}>Edit</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            <ThemedText style={styles.fieldLabel}>Name:</ThemedText>
            <ThemedText style={styles.fieldValue}>{formData.firstName} {formData.surname}</ThemedText>
            
            <ThemedText style={styles.fieldLabel}>Email:</ThemedText>
            <ThemedText style={styles.fieldValue}>{formData.email}</ThemedText>
            
            <ThemedText style={styles.fieldLabel}>ID Number:</ThemedText>
            <ThemedText style={styles.fieldValue}>{formData.idNumber}</ThemedText>
            
            {formData.studentNumber && (
              <>
                <ThemedText style={styles.fieldLabel}>Student Number:</ThemedText>
                <ThemedText style={styles.fieldValue}>{formData.studentNumber}</ThemedText>
              </>
            )}
          </View>
        </View>

        {/* Study Details Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Study Details</ThemedText>
            <TouchableOpacity onPress={() => handleEditSection(2)} style={styles.editButton}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <ThemedText style={[styles.editText, { color: colors.primary }]}>Edit</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            <ThemedText style={styles.fieldLabel}>Qualification:</ThemedText>
            <ThemedText style={styles.fieldValue}>{formData.qualification}</ThemedText>
            
            <ThemedText style={styles.fieldLabel}>Academic Year:</ThemedText>
            <ThemedText style={styles.fieldValue}>{formData.academicYear}</ThemedText>
            
            <ThemedText style={styles.fieldLabel}>Institution:</ThemedText>
            <ThemedText style={styles.fieldValue}>
              {formData.institution === 'Other' ? formData.institutionOther : formData.institution}
            </ThemedText>
            
            <ThemedText style={styles.fieldLabel}>Campus:</ThemedText>
            <ThemedText style={styles.fieldValue}>
              {formData.campus === 'Other' ? formData.campusOther : formData.campus}
            </ThemedText>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

export default ReviewSubmitStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContent: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: 16,
    marginBottom: 8,
  },
});