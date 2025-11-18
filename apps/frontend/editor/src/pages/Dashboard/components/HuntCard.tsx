import { Typography, CardContent } from '@mui/material';
import { StyledHuntCard, HuntDescription } from '../Dashboard.styles';
import type { Hunt } from '@hunthub/shared/types';

interface HuntCardProps {
  hunt: Hunt;
}

export function HuntCard({ hunt }: HuntCardProps) {
  return (
    <StyledHuntCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {hunt.name}
        </Typography>
        <HuntDescription variant="body2" color="text.secondary">
          {hunt.description || 'No description'}
        </HuntDescription>
        <Typography variant="caption" color="text.secondary">
          Version: {hunt.version} | Steps: {hunt.stepOrder?.length || 0}
        </Typography>
      </CardContent>
    </StyledHuntCard>
  );
}
