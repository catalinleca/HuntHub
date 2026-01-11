import { useContext } from 'react';
import { PlaySessionContext } from './context';

export const usePlaySession = () => {
  const context = useContext(PlaySessionContext);
  if (!context) {
    throw new Error('usePlaySession must be used within PlaySessionProvider');
  }
  return context;
};

export const useCurrentStep = () => {
  const { currentStep, currentStepIndex, isLastStep } = usePlaySession();
  return { currentStep, currentStepIndex, isLastStep };
};
