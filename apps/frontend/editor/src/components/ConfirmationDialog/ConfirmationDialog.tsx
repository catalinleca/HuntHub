import { Typography } from '@mui/material';
import { WarningCircleIcon, InfoIcon, TrashSimpleIcon } from '@phosphor-icons/react';
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

  const getConfirmIcon = () => {
    switch (variant) {
      case DialogVariants.Danger:
        return <TrashSimpleIcon size={20} weight="bold" />;
      case DialogVariants.Warning:
        return <WarningCircleIcon size={20} weight="bold" />;
      case DialogVariants.Info:
      default:
        return <InfoIcon size={20} weight="bold" />;
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
      icon: getConfirmIcon(),
    },
  ];

  return (
    <SimpleModal open={isOpen} onClose={handleCancel} title={title} actions={actions} maxWidth="xs">
      <Typography>{message}</Typography>
    </SimpleModal>
  );
};
