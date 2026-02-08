import { PlusIcon } from '@phosphor-icons/react';
import * as S from './AddStepIcon.styles';

interface AddStepIconProps {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export const AddStepIcon = ({ onClick }: AddStepIconProps) => (
  <S.Container onClick={onClick}>
    <PlusIcon size={24} weight="bold" />
  </S.Container>
);
