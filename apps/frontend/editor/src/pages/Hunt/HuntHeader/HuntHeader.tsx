import { useFormState } from 'react-hook-form';
import { HuntTitle, ActionBar } from './components';
import * as S from './HuntHeader.styles';

interface HuntHeaderProps {
  huntId: number;
  huntName: string;
  lastUpdatedBy: string;
  onSave: () => void;
}

export const HuntHeader = ({ huntId, huntName, lastUpdatedBy, onSave }: HuntHeaderProps) => {
  const { dirtyFields, isSubmitting } = useFormState();

  // TODO: check this, we shouldn't need it
  const hasUnsavedChanges = Object.keys(dirtyFields).length > 0;

  return (
    <S.Container>
      <HuntTitle huntName={huntName} lastUpdatedBy={lastUpdatedBy} />

      <ActionBar huntId={huntId} hasUnsavedChanges={hasUnsavedChanges} isSaving={isSubmitting} onSave={onSave} />
    </S.Container>
  );
};
