import { EmbeddedPreview } from './components/EmbeddedPreview';
import { StandalonePreview } from './components/StandalonePreview';

const isRunningInIframe = (): boolean => {
  return window.parent !== window;
};

export const PreviewPage = () => {
  const isEmbedded = isRunningInIframe();

  return isEmbedded ? <EmbeddedPreview /> : <StandalonePreview />;
};
