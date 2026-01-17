import { create } from 'zustand';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarAction {
  label: string;
  onClick: () => void;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  action?: SnackbarAction;

  snackbar: (message: string, severity?: SnackbarSeverity, action?: SnackbarAction) => void;
  success: (message: string, action?: SnackbarAction) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  close: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  action: undefined,

  snackbar: (message, severity = 'info', action) => set({ open: true, message, severity, action }),
  success: (message, action) => set({ open: true, message, severity: 'success', action }),
  error: (message) => set({ open: true, message, severity: 'error', action: undefined }),
  warning: (message) => set({ open: true, message, severity: 'warning', action: undefined }),
  info: (message) => set({ open: true, message, severity: 'info', action: undefined }),
  close: () => set({ open: false, action: undefined }),
}));
