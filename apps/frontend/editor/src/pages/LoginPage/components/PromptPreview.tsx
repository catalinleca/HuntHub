import { Typography } from '@mui/material';
import * as S from '../LoginPage.styles';

interface PromptPreviewProps {
  prompt: string;
}

export const PromptPreview = ({ prompt }: PromptPreviewProps) => (
  <S.PromptCard gap={1}>
    <Typography variant="smMedium" color="text.secondary">
      Creating:
    </Typography>
    <Typography variant="bodyItalic">"{prompt}"</Typography>
  </S.PromptCard>
);
