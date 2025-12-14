import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Asset, AssetCreate } from '@hunthub/shared';
import { requestUpload, uploadToS3, assetKeys } from '@/api/Asset';
import { apiClient } from '@/services/http-client';
import type { UploadingFile, UploadStatus } from './UploadProgress';

interface UseAssetUploadReturn {
  files: UploadingFile[];
  isUploading: boolean;
  hasErrors: boolean;
  allComplete: boolean;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  startUpload: () => Promise<Asset[]>;
  retryFile: (id: string) => void;
  reset: () => void;
}

const generateId = () => crypto.randomUUID();

const getExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

export const useAssetUpload = (): UseAssetUploadReturn => {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const queryClient = useQueryClient();

  const updateFile = useCallback((id: string, updates: Partial<UploadingFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadingFiles: UploadingFile[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending' as UploadStatus,
    }));
    setFiles((prev) => [...prev, ...uploadingFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const uploadSingleFile = useCallback(
    async (uploadingFile: UploadingFile): Promise<Asset | null> => {
      const { id, file } = uploadingFile;

      try {
        updateFile(id, { status: 'uploading', progress: 0 });

        // Step 1: Get presigned URL
        const extension = getExtension(file.name);
        const { signedUrl, publicUrl, s3Key } = await requestUpload(extension);

        // Step 2: Upload to S3
        await uploadToS3(signedUrl, file, (progress) => {
          updateFile(id, { progress: progress.percent });
        });

        // Step 3: Create asset record
        const assetData: AssetCreate = {
          name: file.name,
          mime: file.type,
          sizeBytes: file.size,
          url: publicUrl,
          s3Key,
        };

        const { data: asset } = await apiClient.post<Asset>('/assets', assetData);

        updateFile(id, { status: 'success', progress: 100 });
        return asset;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        updateFile(id, { status: 'error', error: errorMessage });
        return null;
      }
    },
    [updateFile],
  );

  const startUpload = useCallback(async (): Promise<Asset[]> => {
    const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error');
    const uploadedAssets: Asset[] = [];

    // Upload files sequentially to avoid overwhelming the server
    for (const file of pendingFiles) {
      const asset = await uploadSingleFile(file);
      if (asset) {
        uploadedAssets.push(asset);
      }
    }

    // Invalidate assets query to refetch the list
    if (uploadedAssets.length > 0) {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    }

    return uploadedAssets;
  }, [files, queryClient, uploadSingleFile]);

  const retryFile = useCallback(
    (id: string) => {
      updateFile(id, { status: 'pending', progress: 0, error: undefined });
    },
    [updateFile],
  );

  const reset = useCallback(() => {
    setFiles([]);
  }, []);

  const isUploading = files.some((f) => f.status === 'uploading');
  const hasErrors = files.some((f) => f.status === 'error');
  const allComplete = files.length > 0 && files.every((f) => f.status === 'success');

  return {
    files,
    isUploading,
    hasErrors,
    allComplete,
    addFiles,
    removeFile,
    startUpload,
    retryFile,
    reset,
  };
};
