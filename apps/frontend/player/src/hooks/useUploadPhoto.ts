import { useState, useCallback } from 'react';
import type { Asset } from '@hunthub/shared';
import { getExtensionFromMimeType } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { requestUpload, uploadToS3 } from '@/api/asset';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UseUploadPhotoReturn {
  upload: (sessionId: string, file: File) => Promise<number>;
  status: UploadStatus;
  isUploading: boolean;
  error: string | null;
}

export const useUploadPhoto = (): UseUploadPhotoReturn => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (sessionId: string, file: File): Promise<number> => {
    setStatus('uploading');
    setError(null);

    try {
      const extension = getExtensionFromMimeType(file.type);
      const { signedUrl, publicUrl, s3Key } = await requestUpload(sessionId, extension);

      await uploadToS3(signedUrl, file);

      const { data: asset } = await httpClient.post<Asset>(`/play/sessions/${sessionId}/assets`, {
        name: file.name,
        mime: file.type,
        sizeBytes: file.size,
        url: publicUrl,
        s3Key,
      });

      setStatus('success');

      return asset.assetId;
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
      return -1;
    }
  }, []);

  return {
    upload,
    status,
    isUploading: status === 'uploading',
    error,
  };
};
