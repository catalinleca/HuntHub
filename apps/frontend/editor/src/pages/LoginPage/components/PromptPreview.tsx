import { Typography, styled } from '@mui/material';
import * as S from '../LoginPage.styles';

interface PromptPreviewProps {
  prompt: string;
}

const PromptText = styled(Typography)`
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  font-style: italic;
`;

export const PromptPreview = ({ prompt }: PromptPreviewProps) => (
  <S.PromptCard>
    <Typography variant="xsMedium" color="accent.light">
      Creating:
    </Typography>
    <PromptText variant="smRegular">"{prompt}"</PromptText>
  </S.PromptCard>
);
