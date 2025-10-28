import mongoose from 'mongoose';

/**
 * ILiveHunt - Database interface for LiveHunt documents
 *
 * Tracks which published version of a hunt is currently "live" (playable).
 * Each hunt can only have ONE live version at a time (enforced by unique index).
 *
 * Used by player API to determine which hunt version to serve.
 */
export interface ILiveHunt {
  id: string;
  versionId: mongoose.Types.ObjectId;
  createdAt?: string;
  updatedAt?: string;
}
