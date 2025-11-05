export interface PublishResult {
  success: boolean;
  publishedVersion: number;
  newDraftVersion: number;
}

export interface CloneStepsOptions {
  huntId: number;
  sourceVersion: number;
  targetVersion: number;
}
