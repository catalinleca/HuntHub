import { apiClient } from '@/services/http-client';

export interface UploadUrlResponse {
  signedUrl: string;
  publicUrl: string;
  s3Key: string;
}

/**
 * Request a presigned URL for uploading a file to S3
 * @param extension - File extension (e.g., 'jpg', 'mp3', 'mp4')
 */
export const requestUpload = async (extension: string): Promise<UploadUrlResponse> => {
  const { data } = await apiClient.post<UploadUrlResponse>('/assets/request-upload', undefined, {
    params: { extension },
  });
  return data;
};
