import { ArrowRightIcon, TrophyIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/core';
import * as S from './ActionButton.styles';

interface ActionButtonProps {
  onClick: () => void;
  isValidating: boolean;
  isLastStep: boolean;
  isCorrect?: boolean;
  disabled?: boolean;
  label: string;
  loadingLabel?: string;
  color?: string;
}

export const ActionButton = ({
  onClick,
  isValidating,
  isLastStep,
  isCorrect = false,
  disabled = false,
  label,
  loadingLabel = 'Checking...',
  color,
}: ActionButtonProps) => {
  const getButtonContent = () => {
    if (isValidating) {
      return (
        <S.ButtonContent>
          <Spinner />
          {loadingLabel}
        </S.ButtonContent>
      );
    }

    if (isLastStep) {
      return (
        <S.ButtonContent>
          <TrophyIcon size={20} weight="bold" />
          Finish Hunt
        </S.ButtonContent>
      );
    }

    if (isCorrect) {
      return (
        <S.ButtonContent>
          Continue
          <ArrowRightIcon size={20} weight="bold" />
        </S.ButtonContent>
      );
    }

    return <S.ButtonContent>{label}</S.ButtonContent>;
  };

  return (
    <S.StyledButton
      variant="contained"
      size="large"
      onClick={onClick}
      disabled={isValidating || disabled}
      fullWidth
      $color={color}
      $isLoading={isValidating}
    >
      {getButtonContent()}
    </S.StyledButton>
  );
};
