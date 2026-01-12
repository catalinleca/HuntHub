import { createContext, useContext } from 'react';
import type { ValidationContextValue } from './types';

export const ValidationContext = createContext<ValidationContextValue | null>(null);

export const useValidation = (): ValidationContextValue => {
  const context = useContext(ValidationContext);

  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }

  return context;
};
