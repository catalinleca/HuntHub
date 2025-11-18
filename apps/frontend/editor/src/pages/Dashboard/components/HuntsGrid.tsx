import { HuntsGrid as StyledHuntsGrid } from '../Dashboard.styles';
import { HuntCard } from './HuntCard';
import type { Hunt } from '@hunthub/shared/types';

interface HuntsGridProps {
  hunts: Hunt[];
}

export const HuntsGrid = ({ hunts }: HuntsGridProps) => {
  return (
    <StyledHuntsGrid>
      {hunts.map((hunt) => (
        <HuntCard key={hunt.huntId} hunt={hunt} />
      ))}
    </StyledHuntsGrid>
  );
};
