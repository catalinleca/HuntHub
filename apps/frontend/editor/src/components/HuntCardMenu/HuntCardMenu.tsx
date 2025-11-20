import { useState, MouseEvent, ReactNode } from 'react';
import { IconButton, Menu } from '@mui/material';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react';

interface HuntCardMenuProps {
  children: ReactNode;
  icon?: ReactNode;
}

export const HuntCardMenu = ({ children, icon }: HuntCardMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        {icon || <DotsThreeVerticalIcon size={20} />}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClick={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};
