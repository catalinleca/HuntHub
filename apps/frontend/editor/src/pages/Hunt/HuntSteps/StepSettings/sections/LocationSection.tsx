import { FormLocationPicker, getFieldPath } from '@/components/form';
import * as S from '../StepSettings.styles';

interface LocationSectionProps {
  stepIndex: number;
}

export const LocationSection = ({ stepIndex }: LocationSectionProps) => {
  const locationPath = getFieldPath((h) => h.hunt.steps[stepIndex].requiredLocation);

  return (
    <S.SectionCard>
      <FormLocationPicker name={locationPath} label="REQUIRED LOCATION" description="Where must the player be?" />
    </S.SectionCard>
  );
};
