import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { EmbeddedPreview } from './components/EmbeddedPreview';
import { HuntPicker } from './components/HuntPicker';

const isInIframe = () => window.parent !== window;

export const PreviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const huntId = searchParams.get('huntId');
  const isEmbedded = isInIframe();

  useEffect(() => {
    if (!isEmbedded && huntId) {
      navigate(`/play/${huntId}`, { replace: true });
    }
  }, [isEmbedded, huntId, navigate]);

  if (isEmbedded) {
    return <EmbeddedPreview />;
  }

  if (huntId) {
    return null;
  }

  return <HuntPicker />;
};
