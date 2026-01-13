import { useState } from 'react';
import { Alert, Button, Box } from '@mui/material';

interface HintSectionProps {
  hint: string;
}

export const HintSection = ({ hint }: HintSectionProps) => {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  return (
    <Box sx={{ pt: 1 }}>
      {revealed ? (
        <Alert severity="info">{hint}</Alert>
      ) : (
        <Button variant="text" size="small" onClick={handleReveal}>
          Need a hint?
        </Button>
      )}
    </Box>
  );
};
