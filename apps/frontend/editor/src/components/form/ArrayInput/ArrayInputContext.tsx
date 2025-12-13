import { createContext, useContext, ReactNode } from 'react';
import { ArrayActions } from './useArrayInput';

export interface ArrayInputContextValue extends ArrayActions {
  length: number;
}

const ArrayInputContext = createContext<ArrayInputContextValue | null>(null);

export interface ArrayInputProviderProps {
  value: ArrayInputContextValue;
  children: ReactNode;
}

export const ArrayInputProvider = ({ value, children }: ArrayInputProviderProps) => (
  <ArrayInputContext.Provider value={value}>{children}</ArrayInputContext.Provider>
);

export const useArrayInputContext = () => {
  const context = useContext(ArrayInputContext);
  if (!context) {
    throw new Error('useArrayInputContext must be used within ArrayInputProvider');
  }
  return context;
};
