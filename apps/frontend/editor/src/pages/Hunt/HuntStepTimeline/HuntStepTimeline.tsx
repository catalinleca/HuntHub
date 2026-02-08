import { ReactNode, useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { PlusIcon, MapTrifoldIcon, QuestionIcon, TargetIcon, CheckSquareIcon } from '@phosphor-icons/react';
import { ChallengeType } from '@hunthub/shared';
import { useHuntStepsContext } from '@/pages/Hunt/context';
import { ScrollableContainer, SortableStepList, AddStepIcon } from './components';
import * as S from './HuntStepTimeline.styles';

interface HuntStepTimelineProps {
  actions?: ReactNode;
}

export const HuntStepTimeline = ({ actions }: HuntStepTimelineProps) => {
  const { steps, selectedFormKey, setSelectedFormKey, handleCreateStep, handleMoveStep } = useHuntStepsContext();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const scrollToSelector = selectedFormKey ? `[data-form-key="${selectedFormKey}"]` : undefined;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleSelectType = (type: ChallengeType) => {
    handleCreateStep(type);
    handleMenuClose();
  };

  return (
    <S.Wrapper>
      <S.InnerWrapper>
        <ScrollableContainer scrollToSelector={scrollToSelector}>
          <SortableStepList
            steps={steps}
            selectedFormKey={selectedFormKey}
            onSelectStep={setSelectedFormKey}
            onMoveStep={handleMoveStep}
          />
        </ScrollableContainer>
        <AddStepIcon onClick={handleMenuOpen} />
      </S.InnerWrapper>

      <S.MobileAddStep>
        <Button variant="outlined" size="small" startIcon={<PlusIcon size={18} />} onClick={handleMenuOpen}>
          Add Step
        </Button>
      </S.MobileAddStep>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleSelectType(ChallengeType.Clue)}>
          <MapTrifoldIcon size={20} />
          Clue
        </MenuItem>
        <MenuItem onClick={() => handleSelectType(ChallengeType.Quiz)}>
          <QuestionIcon size={20} />
          Quiz
        </MenuItem>
        <MenuItem onClick={() => handleSelectType(ChallengeType.Mission)}>
          <TargetIcon size={20} />
          Mission
        </MenuItem>
        <MenuItem onClick={() => handleSelectType(ChallengeType.Task)}>
          <CheckSquareIcon size={20} />
          Task
        </MenuItem>
      </Menu>

      {actions && <S.ActionsContainer>{actions}</S.ActionsContainer>}
    </S.Wrapper>
  );
};
