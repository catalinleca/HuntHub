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
}

interface DialogStore {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: DialogVariants;
  resolve: ((value: boolean) => void) | null;

  confirm: (options: DialogOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  variant: DialogVariants.Info,
  resolve: null,

  confirm: (options: DialogOptions) => {
    const { resolve: existingResolve, isOpen } = get();
    if (isOpen && existingResolve) {
      existingResolve(false);
    }

    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Confirm',
        cancelText: options.cancelText ?? 'Cancel',
        variant: options.variant ?? DialogVariants.Info,
        resolve,
      });
    });
  },

  handleConfirm: () => {
    const { resolve } = get();
    if (resolve) {
      resolve(true);
    }
    set({ isOpen: false, resolve: null });
  },

  handleCancel: () => {
    const { resolve } = get();
    if (resolve) {
      resolve(false);
    }
    set({ isOpen: false, resolve: null });
  },
}));
