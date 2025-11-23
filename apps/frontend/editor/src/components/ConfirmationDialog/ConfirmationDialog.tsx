import { Typography, Stack, Alert } from '@mui/material';
import { WarningCircleIcon, InfoIcon, TrashSimpleIcon } from '@phosphor-icons/react';
import { DialogVariants, useDialogStore } from '@/stores';
import { SimpleModal, SimpleModalAction } from '@/components/common';

export const ConfirmationDialog = () => {
  const { isOpen, isLoading, error, title, message, confirmText, cancelText, variant, handleConfirm, handleCancel } =
    useDialogStore();

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
      disabled: isLoading,
    },
    {
      label: confirmText,
      onClick: handleConfirm,
      intent: getConfirmIntent(),
      icon: getConfirmIcon(),
      loading: isLoading,
    },
  ];

  const handleDialogClose = () => {
    if (!isLoading) {
      handleCancel();
    }
  };

  return (
    <SimpleModal open={isOpen} onClose={handleDialogClose} title={title} actions={actions} maxWidth="xs">
      <Stack spacing={2}>
        <Typography>{message}</Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Stack>
    </SimpleModal>
  );
};
