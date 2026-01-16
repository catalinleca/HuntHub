import type { HuntMetaPF, StepPF } from '@hunthub/shared';

export const EDITOR_MESSAGES = {
  RENDER_HUNT: 'RENDER_HUNT',
  JUMP_TO_STEP: 'JUMP_TO_STEP',
  SET_VALIDATION_MODE: 'SET_VALIDATION_MODE',
  SET_HINTS: 'SET_HINTS',
} as const;

export type ValidationMode = 'success' | 'fail';
export type HintsMap = Record<number, string>;

export const PLAYER_MESSAGES = {
  PREVIEW_READY: 'PREVIEW_READY',
  STEP_VALIDATED: 'STEP_VALIDATED',
} as const;

export interface PreviewData {
  hunt: HuntMetaPF;
  steps: StepPF[];
}

export const editorMessages = {
  renderHunt: (data: PreviewData) => {
    return {
      type: EDITOR_MESSAGES.RENDER_HUNT,
      hunt: data.hunt,
      steps: data.steps,
    };
  },
  jumpToStep: (stepIndex: number) => {
    return {
      type: EDITOR_MESSAGES.JUMP_TO_STEP,
      stepIndex,
    };
  },
  setValidationMode: (mode: ValidationMode) => {
    return {
      type: EDITOR_MESSAGES.SET_VALIDATION_MODE,
      mode,
    };
  },
  setHints: (hints: HintsMap) => {
    return {
      type: EDITOR_MESSAGES.SET_HINTS,
      hints,
    };
  },
};

export const playerMessages = {
  previewReady: () => {
    return {
      type: PLAYER_MESSAGES.PREVIEW_READY,
    };
  },
  stepValidated: (isCorrect: boolean, feedback: string) => {
    return {
      type: PLAYER_MESSAGES.STEP_VALIDATED,
      isCorrect,
      feedback,
    };
  },
};

export type EditorToPlayerMessage = ReturnType<(typeof editorMessages)[keyof typeof editorMessages]>;

export type PlayerToEditorMessage = ReturnType<(typeof playerMessages)[keyof typeof playerMessages]>;

export const sendToEditor = (message: PlayerToEditorMessage): void => {
  window.parent.postMessage(message, '*');
};

export type PlayerEventCallback = (message: PlayerToEditorMessage) => void;

export class PlayerSDK {
  private iframe: HTMLIFrameElement;
  private targetOrigin: string;
  private listeners: Set<PlayerEventCallback> = new Set();
  private messageHandler: (event: MessageEvent) => void;

  constructor(iframe: HTMLIFrameElement, targetOrigin: string = '*') {
    this.iframe = iframe;
    this.targetOrigin = targetOrigin;
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
  }

  renderHunt(data: PreviewData): void {
    this.send(editorMessages.renderHunt(data));
  }

  jumpToStep(stepIndex: number): void {
    this.send(editorMessages.jumpToStep(stepIndex));
  }

  setValidationMode(mode: ValidationMode): void {
    this.send(editorMessages.setValidationMode(mode));
  }

  setHints(hints: HintsMap): void {
    this.send(editorMessages.setHints(hints));
  }

  onMessage(callback: PlayerEventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  onReady(callback: () => void): () => void {
    return this.onMessage((msg) => {
      if (msg.type === PLAYER_MESSAGES.PREVIEW_READY) {
        callback();
      }
    });
  }

  destroy(): void {
    window.removeEventListener('message', this.messageHandler);
    this.listeners.clear();
  }

  private send(message: EditorToPlayerMessage): void {
    this.iframe.contentWindow?.postMessage(message, this.targetOrigin);
  }

  private handleMessage(event: MessageEvent): void {
    if (event.source !== this.iframe.contentWindow) {
      return;
    }

    const message = event.data as PlayerToEditorMessage;

    if (!message?.type) {
      return;
    }

    this.listeners.forEach((callback) => {
      callback(message);
    });
  }
}
