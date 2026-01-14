import type { HuntMetaPF, StepPF } from '@hunthub/shared';

export const EDITOR_MESSAGES = {
  RENDER_HUNT: 'RENDER_HUNT',
  JUMP_TO_STEP: 'JUMP_TO_STEP',
} as const;

export const PLAYER_MESSAGES = {
  PREVIEW_READY: 'PREVIEW_READY',
  STEP_VALIDATED: 'STEP_VALIDATED',
} as const;

/**
 * Player-safe preview data (no answers, no AI instructions)
 * Use PlayerExporter from @hunthub/shared to transform Hunt → PreviewData
 */
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

// TODO: Replace '*' with specific editor origin (e.g., VITE_EDITOR_ORIGIN) for production security
export const sendToEditor = (message: PlayerToEditorMessage): void => {
  window.parent.postMessage(message, '*');
};

export type PlayerEventCallback = (message: PlayerToEditorMessage) => void;

/**
 * SDK for Editor to communicate with Player iframe via postMessage.
 *
 * IMPORTANT: Use PlayerExporter to sanitize hunt data before sending!
 *
 * ```typescript
 * import { PlayerExporter } from '@hunthub/shared';
 *
 * const previewData = {
 *   hunt: PlayerExporter.hunt(hunt.huntId, hunt),
 *   steps: PlayerExporter.steps(hunt.steps ?? []),
 * };
 * sdk.renderHunt(previewData);
 * ```
 *
 * Constructor:
 *   iframe - The iframe element containing Player
 *   targetOrigin - Security: which origin can receive messages ('*' = any)
 *
 * Commands (Editor → Player):
 *   renderHunt(data) - Send sanitized hunt data to render
 *   jumpToStep(index) - Navigate to specific step
 *
 * Events (Player → Editor):
 *   onMessage(callback) - Listen to all messages, returns unsubscribe fn
 *   onReady(callback) - Fires when Player sends PREVIEW_READY
 *
 * Cleanup:
 *   destroy() - Remove listeners, call on unmount
 */
export class PlayerSDK {
  private iframe: HTMLIFrameElement;
  private targetOrigin: string;
  private listeners: Set<PlayerEventCallback> = new Set();
  private messageHandler: (event: MessageEvent) => void;

  // TODO: In production, pass specific origin instead of '*' for security
  constructor(iframe: HTMLIFrameElement, targetOrigin: string = '*') {
    this.iframe = iframe;
    this.targetOrigin = targetOrigin;
    this.messageHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
  }

  /**
   * Send sanitized hunt data to Player for rendering
   *
   * @param data - Player-safe preview data (use PlayerExporter to create)
   */
  renderHunt(data: PreviewData): void {
    this.send(editorMessages.renderHunt(data));
  }

  jumpToStep(stepIndex: number): void {
    this.send(editorMessages.jumpToStep(stepIndex));
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

  // TODO: Add event.origin validation when targetOrigin is not '*' for production security
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
