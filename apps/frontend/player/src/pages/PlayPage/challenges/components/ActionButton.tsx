import { Button } from '@mui/material';

interface ActionButtonProps {
  onClick: () => void;
  isValidating: boolean;
  isLastStep: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel?: string;
}

export const ActionButton = ({
  onClick,
  isValidating,
  isLastStep,
  disabled = false,
  label,
  loadingLabel = 'Checking...',
}: ActionButtonProps) => {
  const getButtonLabel = () => {
    if (isValidating) {
      return loadingLabel;
    }
    if (isLastStep) {
      return 'Finish Hunt';
    }
    return label;
  };

  return (
    <Button variant="contained" size="large" onClick={onClick} disabled={isValidating || disabled} fullWidth>
      {getButtonLabel()}
    </Button>
  );
};
