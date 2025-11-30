import { createContext, useContext, ReactNode } from 'react';

interface StepFormContextProps {
  onDeleteStep: () => void;
}

const StepFormContext = createContext<StepFormContextProps | null>(null);

export const useStepFormContext = () => {
  const context = useContext(StepFormContext);
  if (!context) {
    throw new Error('useStepFormContext must be used within StepFormProvider');
  }
  return context;
};

interface StepFormProviderProps {
  children: ReactNode;
  onDeleteStep: () => void;
}

export const StepFormProvider = ({ children, onDeleteStep }: StepFormProviderProps) => {
  return <StepFormContext.Provider value={{ onDeleteStep }}>{children}</StepFormContext.Provider>;
};
