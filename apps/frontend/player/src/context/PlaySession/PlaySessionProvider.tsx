import type { ReactNode } from 'react';
import { PlaySessionContext } from './context';
import { useSessionLogic } from './useSessionLogic';
import { usePreviewMode } from './usePreviewMode';
import { PreviewFlow } from './PreviewFlow';

interface PlaySessionProviderProps {
  playSlug: string;
  children: ReactNode;
}

export const PlaySessionProvider = ({ playSlug, children }: PlaySessionProviderProps) => {
  const { isPreviewMode, previewToken } = usePreviewMode();

  // Preview mode: separate flow, auto-creates session
  if (isPreviewMode && previewToken) {
    return (
      <PreviewFlow playSlug={playSlug} previewToken={previewToken}>
        {children}
      </PreviewFlow>
    );
  }

  // Regular mode: existing logic
  return <RegularFlow playSlug={playSlug}>{children}</RegularFlow>;
};

const RegularFlow = ({ playSlug, children }: { playSlug: string; children: ReactNode }) => {
  const value = useSessionLogic(playSlug);
  return <PlaySessionContext.Provider value={value}>{children}</PlaySessionContext.Provider>;
};
