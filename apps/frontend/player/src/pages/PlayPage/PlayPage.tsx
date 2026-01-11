import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import * as S from './PlayPage.styles';

export const PlayPage = () => {
  const { huntId } = useParams<{ huntId: string }>();

  return (
    <S.Container>
      <Typography variant="h4">Play Hunt</Typography>
      <Typography color="text.secondary">Hunt ID: {huntId}</Typography>
    </S.Container>
  );
};
