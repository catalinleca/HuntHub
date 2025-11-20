import { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { DotsThreeOutlineVerticalIcon, PencilSimpleIcon, TrashIcon, CopyIcon } from '@phosphor-icons/react';
import { HuntCardImageProps } from './types';
import * as S from './HuntCard.styles';
import pirateMapFallback from '@/assets/images/pirate-map.webp';
import { getColor } from '@/utils';

export const HuntCardImage = ({
  src,
  alt = 'Hunt cover',
  height,
  isPublished,
  onEdit,
  onDuplicate,
  onDelete,
}: HuntCardImageProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleClose();
    onEdit?.();
  };

  const handleDuplicate = () => {
    handleClose();
    onDuplicate?.();
  };

  const handleDelete = () => {
    handleClose();
    onDelete?.();
  };

  const imageSrc = src || pirateMapFallback;
  const hasMenuActions = onEdit || onDuplicate || onDelete;

  return (
    <S.ImageContainer>
      <S.Image src={imageSrc} alt={alt} $height={height} />
      {isPublished !== undefined && (
        <S.Badge label={isPublished ? 'Published' : 'Draft'} color={isPublished ? 'success' : 'default'} size="small" />
      )}
      {hasMenuActions && (
        <>
          <S.MenuIconButton onClick={handleClick}>
            <DotsThreeOutlineVerticalIcon size={16} weight="bold" color={getColor('primary.main')} />
          </S.MenuIconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose} onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <MenuItem onClick={handleEdit}>
                <ListItemIcon>
                  <PencilSimpleIcon size={18} />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
            )}
            {onDuplicate && (
              <MenuItem onClick={handleDuplicate}>
                <ListItemIcon>
                  <CopyIcon size={18} />
                </ListItemIcon>
                <ListItemText>Duplicate</ListItemText>
              </MenuItem>
            )}
            {onDelete && (
              <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <TrashIcon size={18} />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      )}
    </S.ImageContainer>
  );
};
