import type { Hunt } from '@hunthub/shared';

export const EDITOR_MESSAGES = {
  RENDER_HUNT: 'RENDER_HUNT',
  JUMP_TO_STEP: 'JUMP_TO_STEP',
} as const;

export const PLAYER_MESSAGES = {
  PREVIEW_READY: 'PREVIEW_READY',
  STEP_VALIDATED: 'STEP_VALIDATED',
} as const;

export const editorMessages = {
  renderHunt: (hunt: Hunt) => ({
    type: EDITOR_MESSAGES.RENDER_HUNT,
    hunt,
  }),
  jumpToStep: (stepIndex: number) => ({
    type: EDITOR_MESSAGES.JUMP_TO_STEP,
    stepIndex,
  }),
};

export const playerMessages = {
  previewReady: () => ({
    type: PLAYER_MESSAGES.PREVIEW_READY,
  }),
  stepValidated: (isCorrect: boolean, feedback: string) => ({
    type: PLAYER_MESSAGES.STEP_VALIDATED,
    isCorrect,
    feedback,
  }),
};

export type EditorToPlayerMessage = ReturnType<(typeof editorMessages)[keyof typeof editorMessages]>;

export type PlayerToEditorMessage = ReturnType<(typeof playerMessages)[keyof typeof playerMessages]>;

// TODO: Replace '*' with specific editor origin (e.g., VITE_EDITOR_ORIGIN) for production security
export const sendToEditor = (message: PlayerToEditorMessage): void => {
  window.parent.postMessage(message, '*');
};
