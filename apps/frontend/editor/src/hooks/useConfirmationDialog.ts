import { useDialogStore } from '@/stores';

export const useConfirmationDialog = () => {
  const confirm = useDialogStore((state) => state.confirm);
  return { confirm };
};
