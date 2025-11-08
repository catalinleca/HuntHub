import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IAsset, MimeTypes } from '../types/Asset';
import { getNextSequence } from '@/database/models/Counter';

const assetSchema: Schema<IAsset> = new Schema<IAsset>(
  {
    assetId: {
      type: Number, // numeric ids should be used for API responses
      unique: true,
      required: false,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: Object.values(MimeTypes),
    },
    originalFilename: String,
    size: Number,
    thumbnailUrl: String,
    storageLocation: {
      bucket: String,
      path: String,
    },
    usage: [
      {
        model: String,
        field: String,
        documentId: Schema.Types.ObjectId,
      },
    ],
  },
  {
    timestamps: true,
  },
);

assetSchema.index({ ownerId: 1, createdAt: -1 });
assetSchema.index({ 'usage.documentId': 1 });
assetSchema.index({ mimeType: 1 });

assetSchema.pre('save', async function () {
  if (this.isNew && !this.assetId) {
    this.assetId = await getNextSequence('asset');
  }
});

interface IAssetModel extends Model<IAsset> {
  findByOwner(userId: string): Promise<HydratedDocument<IAsset>[]>;

  findByOwnerAndType(userId: string, mimeType: MimeTypes): Promise<HydratedDocument<IAsset>[]>;

  findByDocumentUsage(documentId: string): Promise<HydratedDocument<IAsset>[]>;

  hasAssets(userId: string): Promise<boolean>;
}

assetSchema.statics.findByOwner = function (userId: string) {
  return this.find({ ownerId: userId }).sort({ createdAt: -1 }).exec();
};

assetSchema.statics.findByOwnerAndType = function (userId: string, mimeType: MimeTypes) {
  return this.find({ ownerId: userId, mimeType }).sort({ createdAt: -1 }).exec();
};

assetSchema.statics.findByDocumentUsage = function (documentId: string) {
  return this.find({ 'usage.documentId': documentId }).exec();
};

assetSchema.statics.hasAssets = async function (userId: string): Promise<boolean> {
  const count = await this.countDocuments({ ownerId: userId }).limit(1);
  return count > 0;
};

const AssetModel = model<IAsset, IAssetModel>('Asset', assetSchema);

export default AssetModel;
