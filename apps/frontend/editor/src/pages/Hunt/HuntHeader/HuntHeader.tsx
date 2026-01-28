import { useFormState } from 'react-hook-form';
import { HuntTitle, ActionBar } from './components';
import * as S from './HuntHeader.styles';

interface HuntHeaderProps {
  huntName: string;
  lastUpdatedBy: string;
  onSave: () => void;
}

export const HuntHeader = ({ huntName, lastUpdatedBy, onSave }: HuntHeaderProps) => {
  const { dirtyFields, isSubmitting } = useFormState();

  const hasUnsavedChanges = Object.keys(dirtyFields).length > 0;

  return (
    <S.Container>
      <HuntTitle huntName={huntName} lastUpdatedBy={lastUpdatedBy} />

      <ActionBar hasUnsavedChanges={hasUnsavedChanges} isSaving={isSubmitting} onSave={onSave} />
    </S.Container>
  );
};
