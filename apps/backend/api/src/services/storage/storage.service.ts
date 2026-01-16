import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  awsAccessKeyId,
  awsCloudFrontDomain,
  awsRegion,
  awsS3Bucket,
  awsSecretAccessKey,
  s3UseAcceleration,
} from '@/config/env.config';
import { injectable } from 'inversify';
import * as crypto from 'node:crypto';
import { getMimeTypeFromExtension } from '@/shared/utils/mimeTypes';

interface UploadUrls {
  signedUrl: string;
  publicUrl: string;
  s3Key: string;
}
export interface IStorageService {
  generateUploadUrls(userId: string, extension: string): Promise<UploadUrls>;
  getPublicUrl(s3Key: string): string;
  validateS3KeyPrefix(s3Key: string, expectedPrefix: string): boolean;
}

@injectable()
export class StorageService implements IStorageService {
  private s3Client: S3Client;
  private bucketName = awsS3Bucket;
  private useAcceleration = s3UseAcceleration;
  private cdnDomain = awsCloudFrontDomain;

  constructor() {
    const baseConfig = {
      region: awsRegion,
      ...(awsSecretAccessKey && {
        credentials: {
          accessKeyId: awsAccessKeyId!,
          secretAccessKey: awsSecretAccessKey,
        },
      }),
    };

    this.s3Client = new S3Client({
      ...baseConfig,
      ...(this.useAcceleration && {
        useAccelerateEndpoint: true,
      }),
    });
  }

  private getS3Key = (userId: string, filename: string): string => {
    return `${userId}/${filename}`;
  };

  private getFilename = (assetId: string, extension: string): string => {
    return `${assetId}.${extension}`;
  };

  getPublicUrl = (s3Key: string): string => {
    return `https://${this.cdnDomain}/${s3Key}`;
  };

  validateS3KeyPrefix = (s3Key: string, expectedPrefix: string): boolean => {
    return s3Key.startsWith(expectedPrefix);
  };

  generateUploadUrls = async (userId: string, extension: string): Promise<UploadUrls> => {
    const assetId = crypto.randomUUID();

    const filename = this.getFilename(assetId, extension);
    const s3Key = this.getS3Key(userId, filename);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: this.getMimeType(extension),
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });
    const publicUrl = this.getPublicUrl(s3Key);

    return {
      signedUrl,
      publicUrl,
      s3Key,
    };
  };

  private getMimeType(extension: string): string {
    return getMimeTypeFromExtension(extension);
  }
}
