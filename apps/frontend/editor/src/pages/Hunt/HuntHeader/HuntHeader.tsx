import { useFormState } from 'react-hook-form';
import { HuntTitle, ActionBar } from './components';
import * as S from './HuntHeader.styles';

interface HuntHeaderProps {
  huntName: string;
  lastUpdatedBy: string;
  onSave: () => void;
}

export const HuntHeader = ({ huntName, lastUpdatedBy, onSave }: HuntHeaderProps) => {
  const { isDirty, isSubmitting } = useFormState();

  return (
    <S.Container>
      <HuntTitle huntName={huntName} lastUpdatedBy={lastUpdatedBy} hasUnsavedChanges={isDirty} />

      <ActionBar hasUnsavedChanges={isDirty} isSaving={isSubmitting} onSave={onSave} />
    </S.Container>
  );
};
