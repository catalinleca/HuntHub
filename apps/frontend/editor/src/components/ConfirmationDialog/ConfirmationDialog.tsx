import { Typography } from '@mui/material';
import { DialogVariants, useDialogStore } from '@/stores';
import { SimpleModal, SimpleModalAction } from '@/components/common';

export const ConfirmationDialog = () => {
  const { isOpen, title, message, confirmText, cancelText, variant, handleConfirm, handleCancel } = useDialogStore();

  const getConfirmIntent = (): SimpleModalAction['intent'] => {
    switch (variant) {
      case DialogVariants.Danger:
        return 'danger';
      case DialogVariants.Warning:
        return 'primary';
      case DialogVariants.Info:
      default:
        return 'primary';
    }
  };

  const actions: SimpleModalAction[] = [
    {
      label: cancelText,
      onClick: handleCancel,
      intent: 'secondary',
    },
    {
      label: confirmText,
      onClick: handleConfirm,
      intent: getConfirmIntent(),
    },
  ];

  return (
    <SimpleModal open={isOpen} onClose={handleCancel} title={title} actions={actions} maxWidth="xs">
      <Typography>{message}</Typography>
    </SimpleModal>
  );
};
