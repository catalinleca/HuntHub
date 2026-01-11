import { Typography } from '@mui/material';
import * as S from './PreviewPage.styles';

export const PreviewPage = () => {
  return (
    <S.Container>
      <Typography variant="h4">Preview Mode</Typography>
      <Typography color="text.secondary">Waiting for hunt data from Editor...</Typography>
    </S.Container>
  );
};
