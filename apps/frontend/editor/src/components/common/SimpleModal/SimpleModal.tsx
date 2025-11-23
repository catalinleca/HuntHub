import React from 'react';
import { Dialog, DialogProps, DialogTitle, DialogContent, DialogActions, Button, Divider, CircularProgress } from '@mui/material';

export interface SimpleModalAction {
  label: string;
  onClick: () => void;
  intent?: 'primary' | 'danger' | 'secondary';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export interface SimpleModalProps extends Omit<DialogProps, 'open' | 'title'> {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: SimpleModalAction[];
  showDivider?: boolean;
}

export const SimpleModal = ({
  open,
  onClose,
  title,
  children,
  actions,
  showDivider = false,
  ...dialogProps
}: SimpleModalProps) => {
  const getButtonProps = (action: SimpleModalAction, index: number) => {
    const isLastAction = index === actions!.length - 1;

    const intentMap = {
      primary: { variant: 'contained' as const, color: 'primary' as const },
      danger: { variant: 'contained' as const, color: 'error' as const },
      secondary: { variant: 'outlined' as const, color: 'primary' as const },
    };

    const intent = action.intent || (isLastAction ? 'primary' : 'secondary');
    return intentMap[intent];
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth {...dialogProps}>
      {title && <DialogTitle>{title}</DialogTitle>}

      <DialogContent>{children}</DialogContent>

      {showDivider && <Divider />}

      {actions && actions.length > 0 && (
        <DialogActions>
          {actions.map((action, index) => (
            <Button
              key={`${action.label}-${index}`}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              startIcon={action.loading ? <CircularProgress size={16} /> : action.icon}
              {...getButtonProps(action, index)}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};
