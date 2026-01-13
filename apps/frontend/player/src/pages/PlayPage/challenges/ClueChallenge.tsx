import { AnswerType, MediaType } from '@hunthub/shared';
import type { CluePF } from '@hunthub/shared';
import { StepContainer, StepContent, StepIndicators, StepActions } from '@/components/step';
import { MediaDisplay } from '@/components/media';
import {
  ActionButton,
  FeedbackDisplay,
  HintSection,
  TimeLimit,
  AttemptsCounter,
} from './components';
import type { ChallengeProps } from '@/types';
import * as S from './ClueChallenge.styles';

const VISUAL_MEDIA_TYPES: MediaType[] = [MediaType.Image, MediaType.Video, MediaType.ImageAudio];

export const ClueChallenge = ({
  challenge,
  media,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
  timeLimit,
  maxAttempts,
}: ChallengeProps<CluePF>) => {
  const handleContinue = () => {
    onValidate(AnswerType.Clue, { clue: {} });
  };

  const hasVisualMedia = media && VISUAL_MEDIA_TYPES.includes(media.type);
  const hasAudioOnly = media?.type === MediaType.Audio;
  const hasIndicators = timeLimit || maxAttempts;

  return (
    <StepContainer>
      {hasIndicators && (
        <StepIndicators>
          {timeLimit && <TimeLimit seconds={timeLimit} onExpire={handleContinue} />}
          {maxAttempts && <AttemptsCounter current={0} max={maxAttempts} onMaxAttempts={handleContinue} />}
        </StepIndicators>
      )}

      <StepContent>
        {hasVisualMedia && <MediaDisplay media={media} />}

        <S.ClueContent>
          {challenge.title && <S.ClueTitle variant="h5">{challenge.title}</S.ClueTitle>}
          {challenge.description && <S.ClueDescription>{challenge.description}</S.ClueDescription>}
        </S.ClueContent>

        {hasAudioOnly && <MediaDisplay media={media} />}

        <FeedbackDisplay feedback={feedback} />

        <HintSection />
      </StepContent>

      <StepActions>
        <ActionButton onClick={handleContinue} isValidating={isValidating} isLastStep={isLastStep} label="Continue" />
      </StepActions>
    </StepContainer>
  );
};
