import { Box, Button, IconButton } from '@mui/material';
import styled from 'styled-components';
import { PlusIcon } from '@phosphor-icons/react';
import { NavBar, UserMenu } from '@/components';

const MobileOnly = styled(Box)`
  display: none;

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: inline-flex;
  }
`;

const DesktopOnly = styled(Box)`
  display: inline-flex;

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: none;
  }
`;

interface DashboardNavBarProps {
  onCreateClick: () => void;
}

export const DashboardNavBar = ({ onCreateClick }: DashboardNavBarProps) => (
  <NavBar
    actions={
      <>
        <MobileOnly>
          <IconButton color="primary" onClick={onCreateClick}>
            <PlusIcon size={24} />
          </IconButton>
        </MobileOnly>
        <DesktopOnly>
          <Button variant="contained" size="medium" startIcon={<PlusIcon size={20} />} onClick={onCreateClick}>
            Create Hunt
          </Button>
        </DesktopOnly>
        <UserMenu />
      </>
    }
  />
);
