import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { HuntDialog } from '@/components';

export const RootLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Outlet />
      <HuntDialog />
    </Box>
  );
};
