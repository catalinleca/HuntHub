import React from 'react';
import { MissionType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { MISSION_BADGES, MISSION_ACTION_LABELS } from '@/constants';
import { ChallengeLayout, ActionButton, FeedbackDisplay } from '@/components/shared';
import type { ChallengeProps } from '@/types';
import { LocationContent } from './LocationContent';
import { PhotoContent } from './PhotoContent';
import { AudioContent } from './AudioContent';

const MISSION_CONTENT = {
  [MissionType.MatchLocation]: LocationContent,
  [MissionType.UploadMedia]: PhotoContent,
  [MissionType.UploadAudio]: AudioContent,
};

export const MissionChallenge = ({
  challenge,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
}: ChallengeProps<MissionPF>) => {
  const badge = MISSION_BADGES[challenge.type];
  const actionLabel = MISSION_ACTION_LABELS[challenge.type];
  const ContentComponent = MISSION_CONTENT[challenge.type];

  const handleSubmit = () => {
    // TODO: Implement mission submission logic per type
  };

  return (
    <ChallengeLayout
      badge={badge}
      title={challenge.title}
      description={challenge.description}
      footer={
        <ActionButton
          onClick={handleSubmit}
          isValidating={isValidating}
          isLastStep={isLastStep}
          label={actionLabel}
        />
      }
    >
      <ContentComponent mission={challenge} />
      <FeedbackDisplay feedback={feedback} />
    </ChallengeLayout>
  );
};
