import { Typography, Box, Button } from '@mui/material';
import { HuntCard, HuntCardImage, HuntCardBody } from '@/components/HuntCard';
import { BookOpenIcon, ClockIcon } from '@phosphor-icons/react';
import * as S from './HuntActionCard.styled';
import { getColor } from '@/utils';

interface HuntActionCardProps {
  image?: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  onClick?: () => void;
}

export const HuntActionCard = ({ image, imageAlt, title, subtitle, metadata, onClick }: HuntActionCardProps) => {
  return (
    <HuntCard transition onClick={onClick} disableGutters>
      <HuntCardImage src={image} alt={imageAlt} />

      <HuntCardBody>
        <S.IconTextRow $color={getColor('primary.main')}>
          <BookOpenIcon weight="bold" />
          <Typography variant="h6" textStyle="display" fontWeight={600}>
            {title}
          </Typography>
        </S.IconTextRow>

        {subtitle && (
          <S.IconTextRow $color={getColor('grey.600')}>
            <ClockIcon weight="bold" size={14} />
            <Typography variant="body2" textStyle="display">
              {subtitle}
            </Typography>
          </S.IconTextRow>
        )}

        <Button variant="contained" fullWidth>
          Resume Crafting
        </Button>
      </HuntCardBody>
    </HuntCard>
  );
};
