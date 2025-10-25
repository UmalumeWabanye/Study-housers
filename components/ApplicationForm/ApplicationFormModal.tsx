import { ThemedText } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApplicationFormProvider, useApplicationForm } from './ApplicationFormContext';
import PersonalDetailsStep from './steps/PersonalDetailsStep';
import ReviewSubmitStep from './steps/ReviewSubmitStep';
import StudyDetailsStep from './steps/StudyDetailsStep';
import SuccessScreen from './SuccessScreen';
const DocumentUploadsStep: React.FC<any> = ({ onNext, onPrevious, isFirstStep, isLastStep }) => {
  return (
    <View style={{ padding: 20 }}>
      <ThemedText>Document uploads step (placeholder)</ThemedText>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity
          onPress={onPrevious}
          style={{ padding: 12, borderRadius: 8, borderWidth: 1, marginRight: 8 }}
        >
          <ThemedText>Previous</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          style={{ padding: 12, borderRadius: 8, backgroundColor: '#007AFF' }}
        >
          <ThemedText style={{ color: '#fff' }}>{isLastStep ? 'Submit' : 'Next'}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};
// The original './steps/ResidenceFunderStep' module was not found; provide an inline placeholder
// to avoid a missing-module compile error while keeping the app functional.
const ResidenceFunderStep: React.FC<any> = ({ onNext, onPrevious, isFirstStep, isLastStep }) => {
  return (
    <View style={{ padding: 20 }}>
      <ThemedText>Residence & Funder step (placeholder)</ThemedText>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity
          onPress={onPrevious}
          style={{ padding: 12, borderRadius: 8, borderWidth: 1, marginRight: 8 }}
        >
          <ThemedText>Previous</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          style={{ padding: 12, borderRadius: 8, backgroundColor: '#007AFF' }}
        >
          <ThemedText style={{ color: '#fff' }}>{isLastStep ? 'Submit' : 'Next'}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const NextOfKinStep: React.FC<any> = ({ onNext, onPrevious, isFirstStep, isLastStep }) => {
  return (
    <View style={{ padding: 20 }}>
      <ThemedText>Next of Kin step (placeholder)</ThemedText>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity
          onPress={onPrevious}
          style={{ padding: 12, borderRadius: 8, borderWidth: 1, marginRight: 8 }}
        >
          <ThemedText>Previous</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          style={{ padding: 12, borderRadius: 8, backgroundColor: '#007AFF' }}
        >
          <ThemedText style={{ color: '#fff' }}>{isLastStep ? 'Submit' : 'Next'}</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;

interface Props {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyTitle: string;
}

const STEPS = [
  { id: 1, title: 'Personal Details', component: PersonalDetailsStep },
  { id: 2, title: 'Study Details', component: StudyDetailsStep },
  { id: 3, title: 'Residence & Funder', component: ResidenceFunderStep },
  { id: 4, title: 'Next of Kin', component: NextOfKinStep },
  { id: 5, title: 'Document Uploads', component: DocumentUploadsStep },
  { id: 6, title: 'Review & Submit', component: ReviewSubmitStep },
];

const ApplicationFormContent: React.FC<Props> = ({ visible, onClose, propertyId, propertyTitle }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { currentStep, setCurrentStep, formData, isSubmitted, submitApplication, setIsSubmitted } = useApplicationForm();
  const [translateY] = useState(new Animated.Value(MODAL_HEIGHT));

  const CurrentStepComponent = STEPS[currentStep - 1]?.component || PersonalDetailsStep;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: MODAL_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible, translateY]);

  const handleClose = () => {
    Animated.spring(translateY, {
      toValue: MODAL_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(onClose);
  };

  const handleBackdropPress = () => {
    handleClose();
  };



  const goToNextStep = async () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle submission on last step
      try {
        console.log('Submitting application:', formData);
        await submitApplication();
        setIsSubmitted(true);
      } catch (error) {
        console.error('Failed to submit application:', error);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  if (isSubmitted) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[
              styles.modal,
              {
                backgroundColor: colors.background,
                transform: [{ translateY }],
                paddingTop: insets.top,
              },
            ]}
          >
            <SuccessScreen onClose={handleClose} />
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor: colors.background,
              transform: [{ translateY }],
              paddingTop: insets.top,
            },
          ]}
        >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.dragHandle} />
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                  <ThemedText variant="title" style={styles.modalTitle}>
                    Application Form
                  </ThemedText>
                  <ThemedText variant="tertiary" style={styles.propertyTitle}>
                    {propertyTitle}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
              <View style={styles.progressBar}>
                {STEPS.map((step, index) => (
                  <TouchableOpacity
                    key={step.id}
                    style={[
                      styles.progressStep,
                      {
                        backgroundColor: index + 1 <= currentStep ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => goToStep(step.id)}
                    disabled={index + 1 > currentStep}
                  >
                    <ThemedText
                      style={[
                        styles.progressStepText,
                        {
                          color: index + 1 <= currentStep ? '#fff' : colors.textSecondary,
                        },
                      ]}
                    >
                      {step.id}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              <ThemedText variant="secondary" style={styles.progressText}>
                Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.title}
              </ThemedText>
            </View>

            {/* Form Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <CurrentStepComponent
                onNext={goToNextStep}
                onPrevious={goToPreviousStep}
                isFirstStep={currentStep === 1}
                isLastStep={currentStep === STEPS.length}
              />
            </ScrollView>

            {/* Navigation Footer */}
            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  styles.secondaryButton,
                  { 
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    opacity: currentStep === 1 ? 0.5 : 1,
                  },
                ]}
                onPress={goToPreviousStep}
                disabled={currentStep === 1}
              >
                <ThemedText style={[styles.footerButtonText, { color: colors.text }]}>
                  Previous
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.footerButton,
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={goToNextStep}
              >
                <ThemedText style={[styles.footerButtonText, { color: '#fff' }]}>
                  {currentStep === STEPS.length ? 'Submit' : 'Next'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
      </View>
    </Modal>
  );
};

const ApplicationFormModal: React.FC<Props> = (props) => {
  return (
    <ApplicationFormProvider propertyId={props.propertyId} propertyTitle={props.propertyTitle}>
      <ApplicationFormContent {...props} />
    </ApplicationFormProvider>
  );
};

export default ApplicationFormModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  propertyTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    // Primary button styles
  },
  secondaryButton: {
    borderWidth: 1,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});