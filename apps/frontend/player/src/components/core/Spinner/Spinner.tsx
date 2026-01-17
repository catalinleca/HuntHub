import * as S from './Spinner.styles';

type SpinnerSize = 'small' | 'medium' | 'large';

interface SpinnerProps {
  size?: SpinnerSize;
}

export const Spinner = ({ size = 'medium' }: SpinnerProps) => {
  return <S.StyledSpinner $size={size} />;
};
