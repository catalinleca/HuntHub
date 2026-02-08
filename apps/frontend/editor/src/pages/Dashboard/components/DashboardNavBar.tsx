import { Button, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { PlusIcon } from '@phosphor-icons/react';
import { NavBar, UserMenu } from '@/components';

interface DashboardNavBarProps {
  onCreateClick: () => void;
}

export const DashboardNavBar = ({ onCreateClick }: DashboardNavBarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <NavBar
      actions={
        <>
          {isMobile ? (
            <IconButton color="primary" onClick={onCreateClick}>
              <PlusIcon size={24} />
            </IconButton>
          ) : (
            <Button variant="contained" size="medium" startIcon={<PlusIcon size={20} />} onClick={onCreateClick}>
              Create Hunt
            </Button>
          )}
          <UserMenu />
        </>
      }
    />
  );
};
