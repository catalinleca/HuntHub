import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { ArrowLeftIcon, CaretDownIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { usePublishingContext } from '@/pages/Hunt/context';
import { VersionPanel } from '../VersionPanel';
import * as S from './HuntTitle.styles';

interface HuntTitleProps {
  huntName: string;
  lastUpdatedBy: string;
}

type VersionStatus = 'live' | 'ready' | 'draft';

const getVersionStatus = (
  latestVersion: number,
  liveVersion: number | null,
): { version: string; status: VersionStatus } => {
  if (liveVersion !== null) {
    return { version: `v${liveVersion}`, status: 'live' };
  }

  if (latestVersion > 1) {
    return { version: `v${latestVersion - 1}`, status: 'ready' };
  }

  return { version: '', status: 'draft' };
};

export const HuntTitle = ({ huntName, lastUpdatedBy }: HuntTitleProps) => {
  const navigate = useNavigate();
  const { latestVersion, liveVersion } = usePublishingContext();

  const [versionPanelAnchor, setVersionPanelAnchor] = useState<HTMLElement | null>(null);

  const { version, status } = getVersionStatus(latestVersion, liveVersion);

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
          <S.VersionBadge onClick={handleStatusClick}>
            {version && <span>{version}</span>}
            {status === 'live' && (
              <>
                <S.LiveDot />
                <span>Live</span>
              </>
            )}
            {status === 'ready' && <span>Ready</span>}
            {status === 'draft' && <span>Draft</span>}
            <CaretDownIcon size={14} />
          </S.VersionBadge>
        </S.TitleRow>
        <Typography variant="caption" color="text.secondary">
          Last updated by {lastUpdatedBy}
        </Typography>
      </S.TitleSection>

      <VersionPanel
        anchorEl={versionPanelAnchor}
        open={Boolean(versionPanelAnchor)}
        onClose={handleVersionPanelClose}
      />
    </S.Container>
  );
};
