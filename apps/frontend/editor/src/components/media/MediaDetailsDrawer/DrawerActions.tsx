import { Button } from '@mui/material';
import * as S from './MediaDetailsDrawer.styles';

export interface DrawerActionsProps {
  onSave: () => void;
  onClose: () => void;
}

export const DrawerActions = ({ onSave, onClose }: DrawerActionsProps) => (
  <S.Footer>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="contained" onClick={onSave}>
      Save
    </Button>
  </S.Footer>
);
