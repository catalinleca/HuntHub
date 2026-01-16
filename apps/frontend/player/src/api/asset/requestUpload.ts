import { httpClient } from '@/services/http-client';

export interface UploadUrlResponse {
  signedUrl: string;
  publicUrl: string;
  s3Key: string;
}

export const requestUpload = async (sessionId: string, extension: string): Promise<UploadUrlResponse> => {
  const { data } = await httpClient.post<UploadUrlResponse>(`/play/sessions/${sessionId}/upload`, undefined, {
    params: { extension },
  });
  return data;
};
