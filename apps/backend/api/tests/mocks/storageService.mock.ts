import { IStorageService } from '@/services/storage/storage.service';
import { injectable } from 'inversify';

@injectable()
export class MockStorageService implements IStorageService {
  async generateUploadUrls(userId: string, extension: string): Promise<{
    signedUrl: string;
    publicUrl: string;
    s3Key: string;
  }> {
    const s3Key = `${userId}/mock-asset-${Date.now()}.${extension}`;

    return {
      signedUrl: `https://hunthub-assets-dev.s3.amazonaws.com/${s3Key}?mock=true`,
      publicUrl: `https://d2vf5nl8r3do9r.cloudfront.net/${s3Key}`,
      s3Key,
    };
  }

  getPublicUrl(s3Key: string): string {
    return `https://d2vf5nl8r3do9r.cloudfront.net/${s3Key}`;
  }
}
