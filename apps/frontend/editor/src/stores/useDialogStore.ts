import { create } from 'zustand';

export enum DialogVariants {
  Info = 'Info',
  Warning = 'Warning',
  Danger = 'Danger',
}

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariants;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  awaitConfirmation?: boolean;
}

interface DialogStore {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: DialogVariants;
  onConfirm: (() => void | Promise<void>) | null;
  onCancel: (() => void | Promise<void>) | null;
  awaitConfirmation: boolean;

  confirm: (options: DialogOptions) => void;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  isLoading: false,
  error: null,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  variant: DialogVariants.Info,
  onConfirm: null,
  onCancel: null,
  awaitConfirmation: true,

  confirm: (options: DialogOptions) => {
    set({
      isOpen: true,
      isLoading: false,
      error: null,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Confirm',
      cancelText: options.cancelText ?? 'Cancel',
      variant: options.variant ?? DialogVariants.Info,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel ?? null,
      awaitConfirmation: options.awaitConfirmation ?? true,
    });
  },

  handleConfirm: async () => {
    const { onConfirm, awaitConfirmation } = get();
    if (!onConfirm) {
      return;
    }

    if (!awaitConfirmation) {
      set({ isOpen: false, isLoading: false, error: null, onConfirm: null, onCancel: null });
      Promise.resolve(onConfirm()).catch((error) => {
        console.error('Dialog onConfirm error:', error);
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await onConfirm();
      set({ isOpen: false, isLoading: false, error: null, onConfirm: null, onCancel: null });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  handleCancel: () => {
    const { onCancel, isLoading } = get();

    if (isLoading) {
      return;
    }

    set({ isOpen: false, isLoading: false, error: null, onConfirm: null, onCancel: null });

    if (onCancel) {
      Promise.resolve(onCancel()).catch((error) => {
        console.error('Dialog onCancel error:', error);
      });
    }
  },
}));
