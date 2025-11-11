/**
 * ILiveHunt - Runtime operational state for published hunts
 *
 * Tracks which version is live + runtime metrics.
 * One document per hunt (unique index on huntId).
 */
export interface ILiveHunt {
  huntId: number; // FK to Hunt (unique)
  huntVersion: number; // Which hunt version is live (FK to HuntVersion)

  // Runtime metrics (mutable)
  activePlayerCount: number;
  lastPlayedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
