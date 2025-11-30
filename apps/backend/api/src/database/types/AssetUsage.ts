import mongoose from 'mongoose';

/**
 * IAssetUsage - Database interface for AssetUsage documents
 *
 * SIMPLIFIED: Hunt-level tracking instead of step-level.
 *
 * Benefits:
 * - Simple schema (2 meaningful fields)
 * - Easy cleanup on hunt delete (no orphan records)
 * - Rebuild from source approach (always correct)
 * - No cascading delete bugs
 *
 * Trade-off: Less granular tracking, but for our use case
 * (preventing asset deletion while in use), hunt-level is sufficient.
 */
export interface IAssetUsage {
  assetId: mongoose.Types.ObjectId;
  huntId: number; // FK to Hunt.huntId
  createdAt?: Date;
}
