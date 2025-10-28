import mongoose from 'mongoose';

/**
 * IPublishedHunt - Database interface for PublishedHunt documents
 *
 * Tracks published versions of hunts. Each time a hunt is published,
 * a new PublishedHunt record is created with an incremented version number.
 *
 * Key features:
 * - Version history (v1, v2, v3, etc.)
 * - Links draft huntId to published versionId
 * - Tracks who published and when
 * - Immutable once created (published versions don't change)
 *
 * Used for:
 * - Version management
 * - Publishing workflow
 * - Rolling back to previous versions
 */
export interface IPublishedHunt {
  id: string;
  huntId: mongoose.Types.ObjectId; // The draft hunt (common identifier)
  versionId: mongoose.Types.ObjectId; // The published hunt clone
  version: number; // Version number (1, 2, 3, etc.)
  name: string;
  publishedAt: Date;
  publishedBy: string;
  createdAt?: string;
  updatedAt?: string;
}
