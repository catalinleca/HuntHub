import { Box, Menu, MenuItem } from '@mui/material';
import { Plus, MapTrifold, Question, Camera, CheckSquare } from '@phosphor-icons/react';
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
        <Plus size={32} weight="bold" />
      </S.Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleSelect(ChallengeType.Clue)}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <MapTrifold size={20} weight="duotone" />
            Clue
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Quiz)}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Question size={20} weight="duotone" />
            Quiz
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Mission)}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Camera size={20} weight="duotone" />
            Mission
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleSelect(ChallengeType.Task)}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <CheckSquare size={20} weight="duotone" />
            Task
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
};
