import { apiClient } from '@/services/http-client';

export interface UploadUrlResponse {
  signedUrl: string;
  publicUrl: string;
  s3Key: string;
}

export const requestUpload = async (extension: string): Promise<UploadUrlResponse> => {
  const { data } = await apiClient.post<UploadUrlResponse>('/assets/request-upload', undefined, {
    params: { extension },
  });
  return data;
};
