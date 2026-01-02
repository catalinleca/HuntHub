import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useGetHunt } from '@/api/Hunt';
import { transformHuntToFormData } from '@/utils/transformers/huntInput';
import { HuntLayout } from './HuntLayout';

export const HuntPage = () => {
  const { id } = useParams<{ id: string }>();
  const huntId = Number(id);

  const { data: hunt, isLoading, error } = useGetHunt(huntId);

  const huntFormData = useMemo(() => {
    if (!hunt) {
      return null;
    }

    return transformHuntToFormData(hunt);
  }, [hunt]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !huntFormData || !hunt) {
    return <Box>Error loading hunt</Box>;
  }

  return <HuntLayout huntFormData={huntFormData} hunt={hunt} />;
};
