import { useState, useCallback, useEffect, useRef, useMemo, type ChangeEvent } from 'react';

interface PhotoCaptureState {
  file: File | null;
  preview: string | null;
  error: string | null;
}

const initialState: PhotoCaptureState = {
  file: null,
  preview: null,
  error: null,
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const usePhotoCapture = () => {
  const [state, setState] = useState<PhotoCaptureState>(initialState);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const handleCapture = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setState((prev) => ({
          ...prev,
          error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)',
        }));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setState((prev) => ({
          ...prev,
          error: 'Image is too large. Maximum size is 10MB.',
        }));
        return;
      }

      revokePreviewUrl();

      const newPreviewUrl = URL.createObjectURL(file);
      previewUrlRef.current = newPreviewUrl;

      setState({
        file,
        preview: newPreviewUrl,
        error: null,
      });
    },
    [revokePreviewUrl],
  );

  const reset = useCallback(() => {
    revokePreviewUrl();
    setState(initialState);
  }, [revokePreviewUrl]);

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, [revokePreviewUrl]);

  return useMemo(
    () => ({
      ...state,
      handleCapture,
      reset,
      hasPhoto: state.file !== null,
    }),
    [state, handleCapture, reset],
  );
};

export type UsePhotoCaptureReturn = ReturnType<typeof usePhotoCapture>;
