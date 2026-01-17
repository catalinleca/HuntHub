import * as S from './Spinner.styles';
import type { SpinnerSize } from './Spinner.styles';

interface SpinnerProps {
  size?: SpinnerSize;
}

export const Spinner = ({ size = 'medium' }: SpinnerProps) => {
  return <S.StyledSpinner $size={size} />;
};
