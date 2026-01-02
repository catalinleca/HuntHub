import { createContext, useContext, ReactNode } from 'react';
import { Hunt } from '@hunthub/shared';
import { usePublishing } from '../hooks';

type PublishingContextValue = ReturnType<typeof usePublishing>;

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

  return <PublishingContext.Provider value={publishing}>{children}</PublishingContext.Provider>;
};
