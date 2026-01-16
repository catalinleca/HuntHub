import { useState, useCallback } from 'react';
import type { Asset } from '@hunthub/shared';
import { getExtensionFromMimeType } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { requestUpload, uploadToS3 } from '@/api/asset';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UseUploadAudioReturn {
  upload: (sessionId: string, blob: Blob, mimeType: string) => Promise<number>;
  status: UploadStatus;
  isUploading: boolean;
  error: string | null;
}

export const useUploadAudio = (): UseUploadAudioReturn => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (sessionId: string, blob: Blob, mimeType: string): Promise<number> => {
    setStatus('uploading');
    setError(null);

    try {
      const extension = getExtensionFromMimeType(mimeType);
      const { signedUrl, publicUrl, s3Key } = await requestUpload(sessionId, extension);

      const file = new File([blob], `recording.${extension}`, { type: mimeType });
      await uploadToS3(signedUrl, file);

      const { data: asset } = await httpClient.post<Asset>(`/play/sessions/${sessionId}/assets`, {
        name: `recording.${extension}`,
        mime: mimeType,
        sizeBytes: blob.size,
        url: publicUrl,
        s3Key,
      });

      setStatus('success');

      return asset.assetId;
    } catch (err) {
      setStatus('error');

      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);

      throw err;
    }
  }, []);

  return {
    upload,
    status,
    isUploading: status === 'uploading',
    error,
  };
};
