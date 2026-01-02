import { ReactNode } from 'react';
import { Typography, IconButton, Divider, Stack } from '@mui/material';
import { TrashIcon } from '@phosphor-icons/react';
import { ChallengeType } from '@hunthub/shared';
import { useHuntStepsContext } from '@/pages/Hunt/context';
import { STEP_TYPE_CONFIG } from '../../stepTypeConfig';
import * as S from './StepCard.styles';
import { getColor } from '@/utils';

interface StepCardProps {
  stepIndex: number;
  type: ChallengeType;
  title?: string;
  children: ReactNode;
}

export const StepCard = ({ stepIndex, type, title, children }: StepCardProps) => {
  const { selectedFormKey, handleDeleteStep } = useHuntStepsContext();

  const onDeleteStep = () => {
    if (selectedFormKey) {
      handleDeleteStep(selectedFormKey);
    }
  };
  const config = STEP_TYPE_CONFIG[type];
  const Icon = config.icon;

  const displayTitle = title || config.label;

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={5} py={4}>
        <Stack direction="row" alignItems="center" gap={2}>
          <S.IconWrapper $bgColor={config.color}>
            <Icon size={24} weight="fill" />
          </S.IconWrapper>

          <Stack direction="column" alignItems="flex-start" justifyContent="center">
            <Typography variant="h6">
              Step {stepIndex + 1}: {displayTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.description}
            </Typography>
          </Stack>
        </Stack>

        <IconButton onClick={onDeleteStep} size="small">
          <TrashIcon size={20} color={getColor('error.main')} />
        </IconButton>
      </Stack>

      <Divider />

      <Stack gap={3} px={5} py={4}>
        {children}
      </Stack>
    </>
  );
};
