import React from 'react';
import { Typography } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import type { TaskPF } from '@hunthub/shared';
import { CHALLENGE_BADGES } from '@/constants';
import { ChallengeLayout, ActionButton, FeedbackDisplay } from '@/components/shared';
import type { ChallengeProps } from '@/types';

export const TaskChallenge = ({
  challenge,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
}: ChallengeProps<TaskPF>) => {
  const handleSubmit = () => {
    // TODO: Implement task submission logic
  };

  return (
    <ChallengeLayout
      badge={CHALLENGE_BADGES[ChallengeType.Task]}
      title={challenge.title}
      description={challenge.instructions}
      footer={
        <ActionButton
          onClick={handleSubmit}
          isValidating={isValidating}
          isLastStep={isLastStep}
          label="Submit"
        />
      }
    >
      <Typography color="warning.main">Work in progress</Typography>
      <FeedbackDisplay feedback={feedback} />
    </ChallengeLayout>
  );
};
