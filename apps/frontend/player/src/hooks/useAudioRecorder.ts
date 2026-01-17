import { useReducer, useCallback, useEffect, useRef } from 'react';
import { RecorderStatus } from '@/constants';

interface State {
  status: RecorderStatus;
  audioUrl: string | null;
  duration: number;
  error: string | null;
}

type Action =
  | { type: 'REQUEST_PERMISSION' }
  | { type: 'START_RECORDING' }
  | { type: 'TICK' }
  | { type: 'STOP'; audioUrl: string }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

const initialState: State = {
  status: RecorderStatus.Idle,
  audioUrl: null,
  duration: 0,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'REQUEST_PERMISSION':
      return { ...initialState, status: RecorderStatus.Requesting };
    case 'START_RECORDING':
      return { ...state, status: RecorderStatus.Recording, duration: 0 };
    case 'TICK':
      return { ...state, duration: state.duration + 1 };
    case 'STOP':
      return { ...state, status: RecorderStatus.Stopped, audioUrl: action.audioUrl };
    case 'ERROR':
      return { ...initialState, status: RecorderStatus.Error, error: action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const SUPPORTED_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
const DEFAULT_MIME_TYPE = 'audio/webm';

const isBrowserSupported = (): boolean => {
  return !!navigator.mediaDevices?.getUserMedia;
};

const getSupportedMimeType = (): string | undefined => {
  return SUPPORTED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
};

const getPermissionErrorMessage = (error: Error): string => {
  const errorMessages: Record<string, string> = {
    NotAllowedError: 'Microphone access denied. Please allow microphone access and try again.',
    PermissionDeniedError: 'Microphone access denied. Please allow microphone access and try again.',
    NotFoundError: 'No microphone found. Please connect a microphone.',
    NotReadableError: 'Microphone is already in use by another application.',
  };
  return errorMessages[error.name] || 'Could not access microphone. Please try again.';
};

export const useAudioRecorder = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const mimeTypeRef = useRef<string | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const revokeAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const clearRefs = useCallback(() => {
    chunksRef.current = [];
    blobRef.current = null;
    mimeTypeRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    stopTimer();

    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    stopStream();
    revokeAudioUrl();
    clearRefs();
  }, [stopTimer, stopStream, revokeAudioUrl, clearRefs]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (!isBrowserSupported()) {
      dispatch({ type: 'ERROR', error: 'Audio recording is not supported in this browser.' });
      return;
    }

    const getMicrophoneStream = async (): Promise<MediaStream> => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      return stream;
    };

    const createRecorder = (stream: MediaStream): MediaRecorder => {
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType || DEFAULT_MIME_TYPE;

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      return recorder;
    };

    const collectAudioChunk = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    const finalizeRecording = () => {
      const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || DEFAULT_MIME_TYPE });
      blobRef.current = blob;

      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      stopStream();
      stopTimer();

      dispatch({ type: 'STOP', audioUrl: url });
    };

    const handleRecordingFailure = () => {
      cleanup();
      dispatch({ type: 'ERROR', error: 'Recording failed. Please try again.' });
    };

    const bindRecorderEvents = (recorder: MediaRecorder) => {
      recorder.ondataavailable = collectAudioChunk;
      recorder.onstop = finalizeRecording;
      recorder.onerror = handleRecordingFailure;
    };

    const startDurationTimer = () => {
      timerRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    };

    cleanup();
    dispatch({ type: 'REQUEST_PERMISSION' });

    try {
      const stream = await getMicrophoneStream();
      const recorder = createRecorder(stream);
      bindRecorderEvents(recorder);

      recorder.start();
      dispatch({ type: 'START_RECORDING' });
      startDurationTimer();
    } catch (err) {
      cleanup();
      dispatch({ type: 'ERROR', error: getPermissionErrorMessage(err as Error) });
    }
  }, [cleanup, stopStream, stopTimer]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const discardRecording = useCallback(() => {
    cleanup();
    dispatch({ type: 'RESET' });
  }, [cleanup]);

  return {
    status: state.status,
    audioUrl: state.audioUrl,
    audioBlob: blobRef.current,
    mimeType: mimeTypeRef.current,
    duration: state.duration,
    error: state.error,
    isRecording: state.status === RecorderStatus.Recording,
    hasRecording: state.status === RecorderStatus.Stopped,
    startRecording,
    stopRecording,
    discardRecording,
  };
};

export type UseAudioRecorderReturn = ReturnType<typeof useAudioRecorder>;
