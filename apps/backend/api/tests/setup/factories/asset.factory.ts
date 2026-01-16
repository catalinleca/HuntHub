import { faker } from '@faker-js/faker';
import { AssetModel } from '@/database/models';
import { IAsset } from '@/database/types/Asset';
import { MimeTypes } from '@hunthub/shared';
import { Types } from 'mongoose';

export interface CreateAssetOptions {
  ownerId?: string;
  mimeType?: MimeTypes;
  originalFilename?: string;
  size?: number;
  url?: string;
  thumbnailUrl?: string;
  storageLocation?: {
    bucket?: string;
    path?: string;
  };
}

export const createTestAsset = async (options: CreateAssetOptions = {}): Promise<IAsset> => {
  const assetData = {
    ownerId: options.ownerId ? new Types.ObjectId(options.ownerId) : new Types.ObjectId(),
    mimeType: options.mimeType || MimeTypes.ImageJpeg,
    originalFilename: options.originalFilename || faker.system.fileName({ extensionCount: 1 }),
    size: options.size || faker.number.int({ min: 1000, max: 5000000 }),
    url:
      options.url ||
      `https://d2vf5nl8r3do9r.cloudfront.net/${faker.string.uuid()}.${faker.system.fileExt('image/jpeg')}`,
    thumbnailUrl: options.thumbnailUrl,
    storageLocation: options.storageLocation || {
      bucket: 'hunthub-assets-dev',
      path: `${faker.string.uuid()}/${faker.system.fileName({ extensionCount: 1 })}`,
    },
  };

  const asset = await AssetModel.create(assetData);
  return asset.toJSON() as IAsset;
};

export const createTestAssets = async (count: number, options: CreateAssetOptions = {}): Promise<IAsset[]> => {
  const assets: IAsset[] = [];

  for (let i = 0; i < count; i++) {
    const asset = await createTestAsset(options);
    assets.push(asset);
  }

  return assets;
};

export const generateAssetCreateData = (
  options: Partial<{
    name: string;
    mime: string;
    sizeBytes: number;
    url: string;
    s3Key: string;
    userId: string;
  }> = {},
) => {
  const userId = options.userId || faker.string.uuid();
  const s3Key = options.s3Key || `${userId}/${faker.system.fileName({ extensionCount: 1 })}`;

  return {
    name: options.name || faker.system.fileName({ extensionCount: 1 }),
    mime: options.mime || MimeTypes.ImageJpeg,
    sizeBytes: options.sizeBytes || faker.number.int({ min: 1000, max: 5000000 }),
    url: options.url || `https://d2vf5nl8r3do9r.cloudfront.net/${s3Key}`,
    s3Key,
  };
};
