import { Button } from '@mui/material';
import { PlusIcon } from '@phosphor-icons/react';
import { NavBar, UserMenu } from '@/components';

interface DashboardNavBarProps {
  onCreateClick: () => void;
}

export const DashboardNavBar = ({ onCreateClick }: DashboardNavBarProps) => {
  return (
    <NavBar
      actions={
        <>
          <Button variant="contained" size="medium" startIcon={<PlusIcon size={20} />} onClick={() => onCreateClick()}>
            Create Hunt
          </Button>
          <UserMenu />
        </>
      }
    />
  );
};
