import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { SignOutIcon, UserIcon } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { StyledAvatar } from './UserMenu.styles';

export const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    signOut();
  };

  const getInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small" aria-label="User Menu">
        <StyledAvatar>{getInitials()}</StyledAvatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <UserIcon size={20} />
          </ListItemIcon>
          <ListItemText primary={user?.email} />
        </MenuItem>

        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon size={20} />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
    </>
  );
};
