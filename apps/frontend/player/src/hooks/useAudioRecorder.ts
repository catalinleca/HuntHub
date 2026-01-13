import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

type RecordingStatus = 'idle' | 'requesting' | 'recording' | 'recorded' | 'error';

interface AudioRecorderState {
  status: RecordingStatus;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  error: string | null;
}

const initialState: AudioRecorderState = {
  status: 'idle',
  audioBlob: null,
  audioUrl: null,
  duration: 0,
  error: null,
};

const AUDIO_MIME_TYPE = 'audio/webm;codecs=opus';
const FALLBACK_MIME_TYPE = 'audio/webm';

const getSupportedMimeType = (): string => {
  if (MediaRecorder.isTypeSupported(AUDIO_MIME_TYPE)) {
    return AUDIO_MIME_TYPE;
  }
  if (MediaRecorder.isTypeSupported(FALLBACK_MIME_TYPE)) {
    return FALLBACK_MIME_TYPE;
  }
  return '';
};

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>(initialState);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Audio recording is not supported in this browser',
      }));
      return;
    }

    cleanup();
    setState((prev) => ({ ...prev, status: 'requesting', error: null }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (timerRef.current !== null) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        setState((prev) => ({
          ...prev,
          status: 'recorded',
          audioBlob: blob,
          audioUrl: url,
        }));
      };

      mediaRecorder.onerror = () => {
        cleanup();
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: 'Recording failed. Please try again.',
        }));
      };

      mediaRecorder.start();

      setState((prev) => ({
        ...prev,
        status: 'recording',
        duration: 0,
      }));

      timerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    } catch (err) {
      cleanup();

      const error = err as Error;
      let errorMessage = 'Could not access microphone';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone permission denied. Please enable microphone access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone.';
      }

      setState((prev) => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
    }
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setState(initialState);
  }, [cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return useMemo(
    () => ({
      ...state,
      startRecording,
      stopRecording,
      reset,
      isRecording: state.status === 'recording',
      hasRecording: state.status === 'recorded',
    }),
    [state, startRecording, stopRecording, reset],
  );
};

export type UseAudioRecorderReturn = ReturnType<typeof useAudioRecorder>;
