import { useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useGetHunt } from '@/api/Hunt';
import { EditorForm } from './EditorForm';

// Let's to some smart loading and only block what we didn't receive, buttons and header should load but later
export const EditorPage = () => {
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

  return <EditorForm hunt={hunt} />;
};
