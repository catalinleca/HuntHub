import type { ReactNode } from 'react';
import { PlaySessionContext } from './context';
import { useSessionLogic } from './useSessionLogic';

interface PlaySessionProviderProps {
  playSlug: string;
  children: ReactNode;
}

export const PlaySessionProvider = ({ playSlug, children }: PlaySessionProviderProps) => {
  const value = useSessionLogic(playSlug);

  return <PlaySessionContext.Provider value={value}>{children}</PlaySessionContext.Provider>;
};
