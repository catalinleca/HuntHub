import { Schema, model } from 'mongoose';

const assetSchema = new Schema(
  {
    originalFilename: String,
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'],
    },
    size: Number,
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,
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
