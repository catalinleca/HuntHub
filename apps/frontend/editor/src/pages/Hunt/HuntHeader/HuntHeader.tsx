import { useState } from 'react';
import { useFormState } from 'react-hook-form';
import { HuntTitle, ActionBar, VersionPanel } from './components';
import * as S from './HuntHeader.styles';

interface HuntHeaderProps {
  huntName: string;
  lastUpdatedBy: string;
  onSave: () => void;
  version: number;
  latestVersion: number;
  liveVersion: number | null;
  isLive: boolean;
  onPublish: () => void;
  onPublishAndRelease: () => void;
  onRelease: (version: number) => void;
  onTakeOffline: () => void;
  isPublishing: boolean;
  isReleasing: boolean;
  isTakingOffline: boolean;
}

export const HuntHeader = ({
  huntName,
  lastUpdatedBy,
  onSave,
  version,
  latestVersion,
  liveVersion,
  isLive,
  onPublish,
  onPublishAndRelease,
  onRelease,
  onTakeOffline,
  isPublishing,
  isReleasing,
  isTakingOffline,
}: HuntHeaderProps) => {
  const { isDirty, isSubmitting } = useFormState();
  const [versionPanelAnchor, setVersionPanelAnchor] = useState<HTMLElement | null>(null);

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setVersionPanelAnchor(event.currentTarget);
  };

  const handleVersionPanelClose = () => {
    setVersionPanelAnchor(null);
  };

  const handleRelease = (versionToRelease: number) => {
    onRelease(versionToRelease);
    handleVersionPanelClose();
  };

  const handleTakeOffline = () => {
    onTakeOffline();
    handleVersionPanelClose();
  };

  return (
    <S.Container>
      <HuntTitle
        huntName={huntName}
        lastUpdatedBy={lastUpdatedBy}
        hasUnsavedChanges={isDirty}
        version={version}
        latestVersion={latestVersion}
        liveVersion={liveVersion}
        isLive={isLive}
        onStatusClick={handleStatusClick}
      />

      <ActionBar
        hasUnsavedChanges={isDirty}
        isSaving={isSubmitting}
        onSave={onSave}
        onPublish={onPublish}
        onPublishAndRelease={onPublishAndRelease}
        isPublishing={isPublishing}
      />

      <VersionPanel
        anchorEl={versionPanelAnchor}
        open={Boolean(versionPanelAnchor)}
        onClose={handleVersionPanelClose}
        latestVersion={latestVersion}
        liveVersion={liveVersion}
        onRelease={handleRelease}
        onTakeOffline={handleTakeOffline}
        isReleasing={isReleasing}
        isTakingOffline={isTakingOffline}
      />
    </S.Container>
  );
};
