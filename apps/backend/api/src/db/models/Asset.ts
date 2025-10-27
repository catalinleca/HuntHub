import { Schema, model } from 'mongoose';
import { IAsset, MimeTypes } from '@db/types';

const assetSchema = new Schema<IAsset>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
    usage: {
      type: [
        {
          model: String, // e.g., 'User', 'Hunt', 'Step'
          field: String, // e.g., 'challenge.mission.targetAssetId', 'profilePicture'
          documentId: Schema.Types.ObjectId,
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
assetSchema.index({ ownerId: 1, createdAt: -1 }); // Get user's media library sorted by newest
assetSchema.index({ 'usage.documentId': 1 }); // Find assets used in specific documents

const Asset = model('Asset', assetSchema);

export default Asset;
