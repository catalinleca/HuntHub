import { Schema, model } from 'mongoose';
import { IAsset, MimeTypes } from '../schemas/Asset';

const assetSchema = new Schema<IAsset>(
  {
    originalFilename: String,
    size: Number,
    thumbnailUrl: String,
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: [Object.values(MimeTypes)],
    },
    storageLocation: {
      bucket: String,
      path: String,
    },
    huntId: {
      type: Schema.Types.ObjectId,
      ref: 'Hunt',
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    usage: {
      type: [
        {
          model: String, // e.g., 'User', 'Hunt', 'Step'
          field: String, // e.g., 'profilePicture', 'media'
          documentId: Schema.Types.ObjectId,
        },
      ],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Asset = model('Asset', assetSchema);

export default Asset;
