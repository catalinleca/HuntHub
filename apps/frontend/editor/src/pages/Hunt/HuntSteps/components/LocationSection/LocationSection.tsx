import { LocationMapContent, getFieldPath } from '@/components/form';
import { Section, SectionTitle } from '../Section/Section.styles';
import type { PaletteColor } from '@/utils/getColor/types';

interface LocationSectionProps {
  stepIndex: number;
  title?: string;
  description?: string;
  color?: PaletteColor;
}

export const LocationSection = ({
  stepIndex,
  title = 'Target Location',
  description,
  color = 'primary.main',
}: LocationSectionProps) => {
  const targetLocationPath = getFieldPath((h) => h.hunt.steps[stepIndex].challenge.mission.targetLocation);

  return (
    <Section $color={color}>
      <SectionTitle $color={color}>{title}</SectionTitle>
      <LocationMapContent name={targetLocationPath} description={description} />
    </Section>
  );
};
