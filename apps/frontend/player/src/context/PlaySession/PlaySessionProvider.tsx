import type { ReactNode } from 'react';
import { PlaySessionContext } from './context';
import { useSessionLogic } from './useSessionLogic';

interface PlaySessionProviderProps {
  huntId: number;
  children: ReactNode;
}

export const PlaySessionProvider = ({ huntId, children }: PlaySessionProviderProps) => {
  const value = useSessionLogic(huntId);

  return <PlaySessionContext.Provider value={value}>{children}</PlaySessionContext.Provider>;
};
