export enum RecorderStatus {
  Idle = 'idle',
  Requesting = 'requesting',
  Recording = 'recording',
  Stopped = 'stopped',
  Error = 'error',
}

export enum SubmissionStatus {
  Idle = 'idle',
  Requesting = 'requesting',
  Recording = 'recording',
  Stopped = 'stopped',
  Error = 'error',
  Submitting = 'submitting',
}

const recorderToSubmissionMap: Record<RecorderStatus, SubmissionStatus> = {
  [RecorderStatus.Idle]: SubmissionStatus.Idle,
  [RecorderStatus.Requesting]: SubmissionStatus.Requesting,
  [RecorderStatus.Recording]: SubmissionStatus.Recording,
  [RecorderStatus.Stopped]: SubmissionStatus.Stopped,
  [RecorderStatus.Error]: SubmissionStatus.Error,
};

export const getSubmissionStatus = (recorderStatus: RecorderStatus, isSubmitting: boolean): SubmissionStatus => {
  if (recorderStatus === RecorderStatus.Stopped && isSubmitting) {
    return SubmissionStatus.Submitting;
  }
  return recorderToSubmissionMap[recorderStatus];
};

export enum PhotoStatus {
  Empty = 'empty',
  HasPhoto = 'has-photo',
  Submitting = 'submitting',
}

export const getPhotoStatus = (hasPhoto: boolean, isSubmitting: boolean): PhotoStatus => {
  if (hasPhoto && isSubmitting) {
    return PhotoStatus.Submitting;
  }
  if (hasPhoto) {
    return PhotoStatus.HasPhoto;
  }
  return PhotoStatus.Empty;
};

export enum LocationStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
  Submitting = 'submitting',
}

export const getLocationStatus = (
  isLoading: boolean,
  error: string | null,
  hasPosition: boolean,
  isSubmitting: boolean,
): LocationStatus => {
  if (hasPosition && isSubmitting) {
    return LocationStatus.Submitting;
  }
  if (error) {
    return LocationStatus.Error;
  }
  if (hasPosition) {
    return LocationStatus.Ready;
  }
  if (isLoading) {
    return LocationStatus.Loading;
  }
  return LocationStatus.Idle;
};
