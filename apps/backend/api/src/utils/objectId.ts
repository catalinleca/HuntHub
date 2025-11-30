import mongoose from 'mongoose';

/**
 * Robust ObjectId validation.
 * Note: mongoose.Types.ObjectId.isValid() returns true for any 12-char string.
 * This adds a round-trip check to ensure the ID is actually valid.
 */
export const isValidObjectId = (id: string): boolean => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }
  return new mongoose.Types.ObjectId(id).toString() === id;
};

export const toObjectId = (id: string): mongoose.Types.ObjectId | null => {
  if (!isValidObjectId(id)) {
    return null;
  }
  return new mongoose.Types.ObjectId(id);
};

/**
 * Convert array of string IDs to ObjectIds, filtering out invalid ones.
 */
export const toObjectIds = (
  ids: string[],
  options?: { warnContext?: string },
): mongoose.Types.ObjectId[] => {
  const result: mongoose.Types.ObjectId[] = [];

  for (const id of ids) {
    const objectId = toObjectId(id);
    if (objectId) {
      result.push(objectId);
    } else if (options?.warnContext) {
      console.warn(`[${options.warnContext}] Skipping invalid ObjectId: ${id}`);
    }
  }

  return result;
};