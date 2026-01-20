import { IconButton, Typography, Chip } from '@mui/material';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useIsPreview, useStepProgress, useNavigateNext, useNavigatePrev } from '@/context/PlaySession';
import * as S from './PreviewNavigation.styles';

export const PreviewNavigation = () => {
  const isPreview = useIsPreview();
  const { currentStepIndex, totalSteps } = useStepProgress();
  const navigateNext = useNavigateNext();
  const navigatePrev = useNavigatePrev();

  if (!isPreview) {
    return null;
  }

  const hasSteps = totalSteps > 0;
  const isFirst = !hasSteps || currentStepIndex === 0;
  const isLast = !hasSteps || currentStepIndex >= totalSteps - 1;

  const handlePrev = () => {
    navigatePrev?.();
  };

  const handleNext = () => {
    navigateNext?.();
  };

  return (
    <S.Toolbar elevation={2}>
      <S.ToolbarContent direction="row" alignItems="center" justifyContent="space-between">
        <Chip label="Preview Mode" size="small" color="warning" variant="outlined" />

        <S.ToolbarContent direction="row" alignItems="center" gap={1}>
          <IconButton onClick={handlePrev} disabled={isFirst} size="small" aria-label="Previous step">
            <CaretLeftIcon size={20} />
          </IconButton>

          <Typography variant="body2" color="text.secondary">
            Step {hasSteps ? currentStepIndex + 1 : 0} of {totalSteps}
          </Typography>

          <IconButton onClick={handleNext} disabled={isLast} size="small" aria-label="Next step">
            <CaretRightIcon size={20} />
          </IconButton>
        </S.ToolbarContent>
      </S.ToolbarContent>
    </S.Toolbar>
  );
};
