import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { EmbeddedPreview } from './components/EmbeddedPreview';
import { NotFoundPage } from '@/pages/NotFoundPage';

const isInIframe = (): boolean => {
  try {
    return typeof window !== 'undefined' && window.parent !== window;
  } catch {
    // Cross-origin iframe access throws - means we're in an iframe
    return true;
  }
};

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

  return <NotFoundPage />;
};
