import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Typography, List, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import { httpClient } from '@/services/http-client';
import * as S from './HuntPicker.styles';

interface DiscoverHunt {
  huntId: number;
  name: string;
  description?: string;
  totalSteps: number;
}

interface DiscoverResponse {
  hunts: DiscoverHunt[];
  total: number;
}

const fetchPublishedHunts = async (): Promise<DiscoverResponse> => {
  const response = await httpClient.get<DiscoverResponse>('/play/discover');
  return response.data;
};

export const HuntPicker = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['discover-hunts'],
    queryFn: fetchPublishedHunts,
  });

  const handleSelectHunt = (huntId: number) => {
    navigate(`/play/${huntId}`);
  };

  return (
    <S.PageContainer>
      <S.PhoneContainer>
        <S.Content>
          <Typography variant="h6" gutterBottom>
            Select a Hunt
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Published hunts from database
          </Typography>

          {isLoading && <CircularProgress size={24} />}

          {error && <Typography color="error">Failed to load hunts. Is the backend running?</Typography>}

          {data && data.hunts.length === 0 && (
            <Typography color="text.secondary">No published hunts found. Create and publish a hunt first.</Typography>
          )}

          {data && data.hunts.length > 0 && (
            <List disablePadding>
              {data.hunts.map((hunt) => (
                <ListItemButton key={hunt.huntId} onClick={() => handleSelectHunt(hunt.huntId)}>
                  <ListItemText primary={hunt.name} secondary={`${hunt.totalSteps} steps`} />
                </ListItemButton>
              ))}
            </List>
          )}
        </S.Content>
      </S.PhoneContainer>
    </S.PageContainer>
  );
};
