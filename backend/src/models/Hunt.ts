import { Schema, model } from 'mongoose';

enum HuntStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

enum HuntVisibility {
  Private = 'private',
  Public = 'public',
  Unlisted = 'unlisted',
}

export interface ILocation {
  lat: number;
  lng: number;
  radius: number;
}

const locationSchema = new Schema<ILocation>({
  lat: Number,
  lng: Number,
  radius: Number,
});

interface HuntDocument {
  creatorId: string;
  name: string;
  description: string;
  isPublished: boolean;
  currentVersion: number;
  stepOrder: string[];
  status: HuntStatus;
  visibility: HuntVisibility;
  startLocation: ILocation;
}

const huntSchema: Schema<HuntDocument> = new Schema<HuntDocument>(
  {
    creatorId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    currentVersion: { type: Number, default: 1 },
    stepOrder: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(HuntStatus),
      default: HuntStatus.Draft,
    },
    visibility: {
      type: String,
      enum: Object.values(HuntVisibility),
      default: HuntVisibility.Private,
    },
    startLocation: locationSchema,
  },
  {
    timestamps: true,
  },
);

const Hunt = model('Hunt', huntSchema);

export default Hunt;
