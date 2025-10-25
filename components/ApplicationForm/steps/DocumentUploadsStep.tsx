import { ThemedText } from '@/components/themed-components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useApplicationForm } from '../ApplicationFormContext';
import { FileUpload } from '../FormInputs';

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const DocumentUploadsStep: React.FC<Props> = ({ onNext }) => {
  const { formData, updateFormData } = useApplicationForm();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.stepTitle}>
          Document Uploads
        </ThemedText>
        <ThemedText variant="secondary" style={styles.stepDescription}>
          Upload the required documents. All files must be under 5MB and in PDF, JPG, or PNG format.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <FileUpload
          label="ID Document"
          value={formData.idDocumentFile}
          onFileSelect={(uri) => updateFormData({ idDocumentFile: uri })}
          required
          acceptedFormats={['PDF', 'JPG', 'PNG']}
          maxSize={5}
        />

        <FileUpload
          label="Proof of Residence"
          value={formData.proofOfResidenceFile}
          onFileSelect={(uri) => updateFormData({ proofOfResidenceFile: uri })}
          required
          acceptedFormats={['PDF', 'JPG', 'PNG']}
          maxSize={5}
        />

        <FileUpload
          label="Academic Results"
          value={formData.academicResultsFile}
          onFileSelect={(uri) => updateFormData({ academicResultsFile: uri })}
          required
          acceptedFormats={['PDF', 'JPG', 'PNG']}
          maxSize={5}
        />

        <FileUpload
          label="Proof of Registration"
          value={formData.proofOfRegistrationFile}
          onFileSelect={(uri) => updateFormData({ proofOfRegistrationFile: uri })}
          required
          acceptedFormats={['PDF', 'JPG', 'PNG']}
          maxSize={5}
        />

        <FileUpload
          label="Proof of Funding"
          value={formData.proofOfFundingFile}
          onFileSelect={(uri) => updateFormData({ proofOfFundingFile: uri })}
          required
          acceptedFormats={['PDF', 'JPG', 'PNG']}
          maxSize={5}
        />
      </View>
    </View>
  );
};

export default DocumentUploadsStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
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
  form: {
    flex: 1,
  },
});