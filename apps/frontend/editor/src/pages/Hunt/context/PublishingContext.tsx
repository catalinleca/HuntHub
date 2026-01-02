import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Hunt } from '@hunthub/shared';
import { usePublishing } from '../hooks';

interface PublishingContextValue {
  // Actions
  handlePublish: () => void;
  handlePublishAndRelease: () => void;
  handleRelease: (version: number) => void;
  handleTakeOffline: () => void;

  // Loading states
  isPublishing: boolean;
  isReleasing: boolean;
  isTakingOffline: boolean;

  // Version info
  version: number;
  latestVersion: number;
  liveVersion: number | null;
  isLive: boolean;
}

const PublishingContext = createContext<PublishingContextValue | null>(null);

export const usePublishingContext = () => {
  const context = useContext(PublishingContext);
  if (!context) {
    throw new Error('usePublishingContext must be used within PublishingProvider');
  }
  return context;
};

interface PublishingProviderProps {
  children: ReactNode;
  hunt: Hunt;
}

export const PublishingProvider = ({ children, hunt }: PublishingProviderProps) => {
  const publishing = usePublishing({ hunt });

  const value = useMemo(
    () => ({
      handlePublish: publishing.handlePublish,
      handlePublishAndRelease: publishing.handlePublishAndRelease,
      handleRelease: publishing.handleRelease,
      handleTakeOffline: publishing.handleTakeOffline,
      isPublishing: publishing.isPublishing,
      isReleasing: publishing.isReleasing,
      isTakingOffline: publishing.isTakingOffline,
      version: publishing.version,
      latestVersion: publishing.latestVersion,
      liveVersion: publishing.liveVersion,
      isLive: publishing.isLive,
    }),
    [
      publishing.handlePublish,
      publishing.handlePublishAndRelease,
      publishing.handleRelease,
      publishing.handleTakeOffline,
      publishing.isPublishing,
      publishing.isReleasing,
      publishing.isTakingOffline,
      publishing.version,
      publishing.latestVersion,
      publishing.liveVersion,
      publishing.isLive,
    ]
  );

  return <PublishingContext.Provider value={value}>{children}</PublishingContext.Provider>;
};
