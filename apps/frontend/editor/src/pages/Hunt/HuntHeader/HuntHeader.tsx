import { HuntTitle, ActionBar } from './components';
import * as S from './HuntHeader.styles';

interface HuntHeaderProps {
  huntName: string;
  lastUpdatedBy: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const HuntHeader = ({
  huntName,
  lastUpdatedBy,
  hasUnsavedChanges,
  isSaving,
  onSave
}: HuntHeaderProps) => {
  return (
    <S.Container>
      <HuntTitle
        huntName={huntName}
        lastUpdatedBy={lastUpdatedBy}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <ActionBar
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        onSave={onSave}
      />
    </S.Container>
  );
};
