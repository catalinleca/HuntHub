import { create } from 'zustand';

interface HuntDialogStore {
  isOpen: boolean;
  huntId: number | null;

  open: (huntId?: number) => void;
  close: () => void;
}

export const useHuntDialogStore = create<HuntDialogStore>((set) => ({
  isOpen: false,
  huntId: null,

  open: (huntId?: number) => {
    set({
      isOpen: true,
      huntId: huntId ?? null,
    });
  },

  close: () => {
    set({
      isOpen: false,
      huntId: null,
    });
  },
}));
