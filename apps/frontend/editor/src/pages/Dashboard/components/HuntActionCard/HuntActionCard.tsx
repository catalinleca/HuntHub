import { Typography, Button } from '@mui/material';
import { HuntCard, HuntCardImage, HuntCardBody } from '@/components/HuntCard';
import { BookOpenIcon, ClockIcon } from '@phosphor-icons/react';
import * as S from './HuntActionCard.styled';
import { getColor } from '@hunthub/compass';

interface HuntActionCardProps {
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  isPublished?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onClone?: () => void;
  onDelete?: () => void;
}

export const HuntActionCard = ({
  image,
  imageAlt,
  title,
  subtitle,
  isPublished,
  onClick,
  onEdit,
  onClone,
  onDelete,
}: HuntActionCardProps) => {
  return (
    <HuntCard transition onClick={onClick} disableGutters>
      <HuntCardImage
        src={image}
        alt={imageAlt}
        isPublished={isPublished}
        onEdit={onEdit}
        onClone={onClone}
        onDelete={onDelete}
      />

      <HuntCardBody>
        <S.IconTextRow $color={getColor('primary.main')}>
          <BookOpenIcon weight="bold" size={14} />
          <Typography variant="displayH6">{title}</Typography>
        </S.IconTextRow>

        {subtitle && (
          <S.IconTextRow $color={getColor('grey.600')}>
            <ClockIcon weight="bold" size={12} />
            <Typography variant="displayBody2">{subtitle}</Typography>
          </S.IconTextRow>
        )}

        <Button variant="contained" fullWidth>
          Resume Crafting
        </Button>
      </HuntCardBody>
    </HuntCard>
  );
};
