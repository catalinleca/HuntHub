import { create } from 'zustand';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;

  snackbar: (message: string, severity?: SnackbarSeverity) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  close: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'info',

  snackbar: (message, severity = 'info') => set({ open: true, message, severity }),
  success: (message) => set({ open: true, message, severity: 'success' }),
  error: (message) => set({ open: true, message, severity: 'error' }),
  warning: (message) => set({ open: true, message, severity: 'warning' }),
  info: (message) => set({ open: true, message, severity: 'info' }),
  close: () => set({ open: false }),
}));
