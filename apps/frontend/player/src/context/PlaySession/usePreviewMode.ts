import { useMemo } from 'react';

export const usePreviewMode = () => {
  const previewToken = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('preview') ?? null;
  }, []);

  return {
    isPreviewMode: previewToken !== null,
    previewToken,
  };
};
