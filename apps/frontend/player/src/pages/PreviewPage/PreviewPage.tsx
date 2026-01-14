import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { EmbeddedPreview } from './components/EmbeddedPreview';
import { HuntPicker } from './components/HuntPicker';

const isInIframe = () => window.parent !== window;

export const PreviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const huntId = searchParams.get('huntId');

  // Embedded mode - Editor sends data via SDK
  if (isInIframe()) {
    return <EmbeddedPreview />;
  }

  // Standalone with huntId - redirect to play route
  useEffect(() => {
    if (huntId) {
      navigate(`/play/${huntId}`, { replace: true });
    }
  }, [huntId, navigate]);

  if (huntId) {
    return null;
  }

  // Standalone without huntId - show hunt picker in phone container
  return <HuntPicker />;
};
