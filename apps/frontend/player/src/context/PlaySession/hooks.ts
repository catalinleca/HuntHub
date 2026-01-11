import { useContext } from 'react';
import { PlaySessionContext } from './context';

export const usePlaySession = () => {
  const context = useContext(PlaySessionContext);
  if (!context) {
    throw new Error('usePlaySession must be used within PlaySessionProvider');
  }
  return context;
};

export const useStepProgress = () => {
  const { currentStep, currentStepIndex, isLastStep, totalSteps } = usePlaySession();
  return { currentStep, currentStepIndex, isLastStep, totalSteps };
};
