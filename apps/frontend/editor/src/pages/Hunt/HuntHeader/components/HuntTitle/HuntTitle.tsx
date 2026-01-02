import { useState } from 'react';
import { Typography, Chip } from '@mui/material';
import { ArrowLeftIcon, CaretDownIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { usePublishingContext } from '@/pages/Hunt/context';
import { VersionPanel } from '../VersionPanel';
import * as S from './HuntTitle.styles';

interface HuntTitleProps {
  huntName: string;
  lastUpdatedBy: string;
  hasUnsavedChanges: boolean;
}

const getStatusBadge = (
  latestVersion: number,
  liveVersion: number | null
): { label: string; color: 'default' | 'primary' | 'success' } => {
  if (liveVersion !== null) {
    return { label: `v${liveVersion} Live`, color: 'success' };
  }

  if (latestVersion > 1) {
    return { label: `v${latestVersion - 1} Ready`, color: 'primary' };
  }

  return { label: `Draft`, color: 'default' };
};

export const HuntTitle = ({ huntName, lastUpdatedBy, hasUnsavedChanges }: HuntTitleProps) => {
  const navigate = useNavigate();
  const { latestVersion, liveVersion } = usePublishingContext();

  const [versionPanelAnchor, setVersionPanelAnchor] = useState<HTMLElement | null>(null);

  const statusBadge = getStatusBadge(latestVersion, liveVersion);

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setVersionPanelAnchor(event.currentTarget);
  };

  const handleVersionPanelClose = () => {
    setVersionPanelAnchor(null);
  };

  return (
    <S.Container>
      <S.BackButton onClick={() => navigate('/dashboard')}>
        <ArrowLeftIcon size={20} />
      </S.BackButton>

      <S.TitleSection>
        <S.TitleRow>
          <Typography variant="h6" fontWeight={600}>
            {huntName}
          </Typography>
          <Chip
            label={statusBadge.label}
            size="small"
            color={statusBadge.color}
            onClick={handleStatusClick}
            onDelete={handleStatusClick}
            deleteIcon={<CaretDownIcon size={14} />}
            sx={{ cursor: 'pointer' }}
          />
          {hasUnsavedChanges && <Chip label="Unsaved changes" size="small" color="warning" variant="outlined" />}
        </S.TitleRow>
        <Typography variant="caption" color="text.secondary">
          Last updated by {lastUpdatedBy}
        </Typography>
      </S.TitleSection>

      <VersionPanel anchorEl={versionPanelAnchor} open={Boolean(versionPanelAnchor)} onClose={handleVersionPanelClose} />
    </S.Container>
  );
};
