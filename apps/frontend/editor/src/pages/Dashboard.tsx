import { Container, Typography, Box, Button, Card, CardContent, Dialog } from '@mui/material';
import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { huntsApi } from '@/api/hunts';
import { CreateHuntForm } from '@/components';
import styled from 'styled-components';
import { useState } from 'react';

// Example of using styled-components with MUI theme
const StyledHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledHuntCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[8]};
  }
`;

function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch hunts using React Query
  const { data: hunts, isLoading, error } = useQuery({
    queryKey: ['hunts'],
    queryFn: huntsApi.getAll,
  });

  const handleCreateHunt = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <StyledHeader>
        <Typography variant="h3" component="h1">
          My Hunts
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<Plus size={20} />}
          onClick={handleCreateHunt}
        >
          Create Hunt
        </Button>
      </StyledHeader>

      {/* Loading state */}
      {isLoading && (
        <Typography variant="body1" color="text.secondary">
          Loading hunts...
        </Typography>
      )}

      {/* Error state */}
      {error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Backend not running
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start the backend API: <code>npm run dev:backend</code>
          </Typography>
        </Box>
      )}

      {/* Empty state */}
      {!isLoading && !error && hunts?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No hunts yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first treasure hunt to get started!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Plus size={20} />}
            onClick={handleCreateHunt}
          >
            Create Your First Hunt
          </Button>
        </Box>
      )}

      {/* Hunts grid */}
      {!isLoading && hunts && hunts.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {hunts.map((hunt) => (
            <StyledHuntCard key={hunt.huntId}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {hunt.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {hunt.description || 'No description'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Version: {hunt.version} | Steps: {hunt.stepOrder?.length || 0}
                </Typography>
              </CardContent>
            </StyledHuntCard>
          ))}
        </Box>
      )}

      {/* Create Hunt Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <CreateHuntForm />
      </Dialog>
    </Container>
  );
}

export default Dashboard;
