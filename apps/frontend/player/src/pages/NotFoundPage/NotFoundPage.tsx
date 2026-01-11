import { Typography } from '@mui/material';
import * as S from './NotFoundPage.styles';

export const NotFoundPage = () => {
  return (
    <S.Container>
      <Typography variant="h4">Page Not Found</Typography>
      <Typography color="text.secondary">Scan a QR code to play a treasure hunt</Typography>
    </S.Container>
  );
};
