import { AnswerType, MediaType } from '@hunthub/shared';
import type { CluePF } from '@hunthub/shared';
import { StepContainer, StepContent, StepActions } from '@/components/step';
import { MediaDisplay } from '@/components/media';
import { ActionButton, FeedbackDisplay } from './components';
import type { ChallengeProps } from '@/types';
import * as S from './ClueChallenge.styles';

const VISUAL_MEDIA_TYPES: MediaType[] = [
  MediaType.Image,
  MediaType.Video,
  MediaType.ImageAudio,
];

export const ClueChallenge = ({
  challenge,
  media,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
}: ChallengeProps<CluePF>) => {
  const handleContinue = () => {
    onValidate(AnswerType.Clue, { clue: {} });
  };

  const hasVisualMedia = media && VISUAL_MEDIA_TYPES.includes(media.type);
  const hasAudioOnly = media?.type === MediaType.Audio;

  return (
    <StepContainer>
      <StepContent>
        {hasVisualMedia && <MediaDisplay media={media} />}

        <S.ClueContent>
          {challenge.title && (
            <S.ClueTitle variant="h5">{challenge.title}</S.ClueTitle>
          )}
          {challenge.description && (
            <S.ClueDescription>{challenge.description}</S.ClueDescription>
          )}
        </S.ClueContent>

        {hasAudioOnly && <MediaDisplay media={media} />}

        <FeedbackDisplay feedback={feedback} />
      </StepContent>

      <StepActions>
        <ActionButton
          onClick={handleContinue}
          isValidating={isValidating}
          isLastStep={isLastStep}
          label="Continue"
        />
      </StepActions>
    </StepContainer>
  );
};
