import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography } from '@mui/material';
import { UploadIcon, CheckIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';
import { DropZone } from '../DropZone';
import { UploadProgress } from '../UploadProgress';
import { useAssetUpload } from './useAssetUpload';

export interface CreateAssetModalProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: (assets: Asset[]) => void;
}

export const CreateAssetModal = ({ open, onClose, onUploadComplete }: CreateAssetModalProps) => {
  const { files, isUploading, allComplete, addFiles, removeFile, startUpload, retryFile, reset } = useAssetUpload();

  const hasFiles = files.length > 0;
  const hasPendingFiles = files.some((f) => f.status === 'pending' || f.status === 'error');

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleUpload = async () => {
    const uploadedAssets = await startUpload();
    if (uploadedAssets.length > 0) {
      onUploadComplete?.(uploadedAssets);
    }
  };

  const handleDone = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Assets</DialogTitle>

      <DialogContent>
        <Stack gap={3}>
          {/* Drop zone - hide when all complete */}
          {!allComplete && <DropZone onFilesAccepted={addFiles} disabled={isUploading} />}

          {/* File list with progress */}
          {hasFiles && (
            <Stack gap={1}>
              <Typography variant="body2" color="text.secondary">
                {allComplete
                  ? `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`
                  : `${files.length} file${files.length > 1 ? 's' : ''} selected`}
              </Typography>
              <UploadProgress
                files={files}
                onRemove={isUploading ? undefined : removeFile}
                onRetry={isUploading ? undefined : retryFile}
              />
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          Cancel
        </Button>

        {allComplete ? (
          <Button variant="contained" onClick={handleDone} startIcon={<CheckIcon size={20} weight="bold" />}>
            Done
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!hasPendingFiles || isUploading}
            startIcon={<UploadIcon size={20} weight="bold" />}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
