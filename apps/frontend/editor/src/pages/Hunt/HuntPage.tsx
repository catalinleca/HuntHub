import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useGetHunt } from '@/api/Hunt';
import { HuntLayout } from './HuntLayout';

export const HuntPage = () => {
  const { id } = useParams<{ id: string }>();
  const huntId = Number(id);

  const { data: hunt, isLoading, error } = useGetHunt(huntId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !hunt) {
    return <Box>Error loading hunt</Box>;
  }

  return <HuntLayout hunt={hunt} />;
};
