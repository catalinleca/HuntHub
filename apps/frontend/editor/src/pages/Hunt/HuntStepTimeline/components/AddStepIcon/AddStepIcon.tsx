import { Stack, Menu, MenuItem } from '@mui/material';
import { PlusIcon, MapTrifoldIcon, QuestionIcon, CameraIcon, CheckSquareIcon } from '@phosphor-icons/react';
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
          <Stack direction="row" spacing={2} alignItems="center">
            <MapTrifoldIcon size={20} weight="duotone" />
            Clue
          </Stack>
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Quiz)}>
          <Stack direction="row" spacing={2} alignItems="center">
            <QuestionIcon size={20} weight="duotone" />
            Quiz
          </Stack>
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Mission)}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CameraIcon size={20} weight="duotone" />
            Mission
          </Stack>
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Task)}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CheckSquareIcon size={20} weight="duotone" />
            Task
          </Stack>
        </MenuItem>
      </Menu>
    </>
  );
};
