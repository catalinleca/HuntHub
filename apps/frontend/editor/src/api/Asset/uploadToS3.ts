import axios from 'axios';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export type ProgressCallback = (progress: UploadProgress) => void;

export const uploadToS3 = async (signedUrl: string, file: File, onProgress?: ProgressCallback): Promise<void> => {
  await axios.put(signedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percent: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        });
      }
    },
  });
};
