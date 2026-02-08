import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: 0.8,
  preserveExif: false,
};

export const compressImage = async (file: File): Promise<File> => {
  if (file.type === 'image/gif') {
    return file;
  }

  return imageCompression(file, COMPRESSION_OPTIONS);
};
