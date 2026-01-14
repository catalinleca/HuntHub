import { useReducer, useCallback, useEffect, useRef } from 'react';

export type Status = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

interface State {
  status: Status;
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
  status: 'idle',
  audioUrl: null,
  duration: 0,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'REQUEST_PERMISSION':
      return { ...initialState, status: 'requesting' };
    case 'START_RECORDING':
      return { ...state, status: 'recording', duration: 0 };
    case 'TICK':
      return { ...state, duration: state.duration + 1 };
    case 'STOP':
      return { ...state, status: 'stopped', audioUrl: action.audioUrl };
    case 'ERROR':
      return { ...initialState, status: 'error', error: action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const getErrorMessage = (error: Error): string => {
  switch (error.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Microphone access denied. Please allow microphone access and try again.';
    case 'NotFoundError':
      return 'No microphone found. Please connect a microphone.';
    case 'NotReadableError':
      return 'Microphone is already in use by another application.';
    default:
      return 'Could not access microphone. Please try again.';
  }
};

const getSupportedMimeType = (): string | undefined => {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return types.find((type) => MediaRecorder.isTypeSupported(type));
};

export const useAudioRecorder = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      dispatch({ type: 'ERROR', error: 'Audio recording is not supported in this browser.' });
      return;
    }

    cleanup();
    dispatch({ type: 'REQUEST_PERMISSION' });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        streamRef.current?.getTracks().forEach((track) => track.stop());

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        dispatch({ type: 'STOP', audioUrl: url });
      };

      recorder.onerror = () => {
        cleanup();
        dispatch({ type: 'ERROR', error: 'Recording failed. Please try again.' });
      };

      recorder.start();
      dispatch({ type: 'START_RECORDING' });

      timerRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } catch (err) {
      cleanup();
      dispatch({ type: 'ERROR', error: getErrorMessage(err as Error) });
    }
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    dispatch({ type: 'RESET' });
  }, [cleanup]);

  return {
    status: state.status,
    audioUrl: state.audioUrl,
    duration: state.duration,
    error: state.error,
    isRecording: state.status === 'recording',
    hasRecording: state.status === 'stopped',
    startRecording,
    stopRecording,
    reset,
  };
};

export type UseAudioRecorderReturn = ReturnType<typeof useAudioRecorder>;
