import { useState, useCallback, useEffect, useRef, useMemo, type ChangeEvent } from 'react';
import { compressImage } from '@/utils';

interface PhotoCaptureState {
  file: File | null;
  preview: string | null;
  error: string | null;
  isCompressing: boolean;
}

const initialState: PhotoCaptureState = {
  file: null,
  preview: null,
  error: null,
  isCompressing: false,
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_INPUT_FILE_SIZE = 25 * 1024 * 1024;
const MAX_COMPRESSED_FILE_SIZE = 10 * 1024 * 1024;

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
    async (event: ChangeEvent<HTMLInputElement>) => {
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

      if (file.size > MAX_INPUT_FILE_SIZE) {
        setState((prev) => ({
          ...prev,
          error: 'Image is too large. Maximum size is 25MB.',
        }));
        return;
      }

      revokePreviewUrl();
      setState((prev) => ({ ...prev, isCompressing: true, error: null }));

      let compressed: File;
      try {
        compressed = await compressImage(file);
      } catch {
        setState((prev) => ({
          ...prev,
          isCompressing: false,
          error: 'Failed to process image. Please try again.',
        }));
        return;
      }

      if (compressed.size > MAX_COMPRESSED_FILE_SIZE) {
        setState((prev) => ({
          ...prev,
          isCompressing: false,
          error: 'Image is too large after processing. Please try a smaller image.',
        }));
        return;
      }

      const newPreviewUrl = URL.createObjectURL(compressed);
      previewUrlRef.current = newPreviewUrl;

      setState({
        file: compressed,
        preview: newPreviewUrl,
        error: null,
        isCompressing: false,
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
