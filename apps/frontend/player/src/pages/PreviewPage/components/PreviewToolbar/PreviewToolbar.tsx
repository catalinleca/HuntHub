import { IconButton, Typography, Chip } from '@mui/material';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import * as S from './PreviewToolbar.styles';

interface PreviewToolbarProps {
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Go to previous step */
  onPrev: () => void;
  /** Go to next step */
  onNext: () => void;
}

/**
 * Toolbar for standalone preview mode
 * Shows step navigation (prev/next) and current position
 */
export const PreviewToolbar = ({ currentStep, totalSteps, onPrev, onNext }: PreviewToolbarProps) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <S.Toolbar elevation={2}>
      <S.ToolbarContent direction="row" alignItems="center" justifyContent="space-between">
        <Chip label="Preview Mode" size="small" color="warning" variant="outlined" />

        <S.ToolbarContent direction="row" alignItems="center" gap={1}>
          <IconButton onClick={onPrev} disabled={isFirst} size="small" aria-label="Previous step">
            <CaretLeftIcon size={20} />
          </IconButton>

          <Typography variant="body2" color="text.secondary">
            Step {currentStep + 1} of {totalSteps}
          </Typography>

          <IconButton onClick={onNext} disabled={isLast} size="small" aria-label="Next step">
            <CaretRightIcon size={20} />
          </IconButton>
        </S.ToolbarContent>
      </S.ToolbarContent>
    </S.Toolbar>
  );
};
