import { Menu, MenuItem } from '@mui/material';
import { PlusIcon, MapTrifoldIcon, QuestionIcon, TargetIcon, CheckSquareIcon } from '@phosphor-icons/react';
import { ChallengeType } from '@hunthub/shared';
import { useState } from 'react';
import * as S from './AddStepIcon.styles';

interface AddStepIconProps {
  onAddStep: (type: ChallengeType) => void;
}

export const AddStepIcon = ({ onAddStep }: AddStepIconProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (type: ChallengeType) => {
    onAddStep(type);
    handleClose();
  };

  return (
    <>
      <S.Container onClick={handleClick}>
        <PlusIcon size={24} weight="bold" />
      </S.Container>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleSelect(ChallengeType.Clue)}>
          <MapTrifoldIcon size={20} />
          Clue
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Quiz)}>
          <QuestionIcon size={20} />
          Quiz
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Mission)}>
          <TargetIcon size={20} />
          Mission
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Task)}>
          <CheckSquareIcon size={20} />
          Task
        </MenuItem>
      </Menu>
    </>
  );
};
