# @hunthub/player-sdk

SDK for Editor ↔ Player iframe communication via postMessage.

## Installation

Already included in monorepo. Add to your package.json:

```json
{
  "dependencies": {
    "@hunthub/player-sdk": "*"
  }
}
```

## Usage

### In Player (inside iframe)

```typescript
import {
  EDITOR_MESSAGES,
  playerMessages,
  sendToEditor,
  type EditorToPlayerMessage
} from '@hunthub/player-sdk';

// Listen for messages from Editor
window.addEventListener('message', (event) => {
  const message = event.data as EditorToPlayerMessage;

  switch (message.type) {
    case EDITOR_MESSAGES.RENDER_HUNT:
      renderHunt(message.hunt);
      break;
    case EDITOR_MESSAGES.JUMP_TO_STEP:
      goToStep(message.stepIndex);
      break;
  }
});

// Send messages to Editor
sendToEditor(playerMessages.previewReady());
sendToEditor(playerMessages.stepValidated(true, 'Correct!'));
```

### In Editor (parent window)

```typescript
import { PlayerSDK, PLAYER_MESSAGES } from '@hunthub/player-sdk';
import type { Hunt } from '@hunthub/shared';

function PreviewPanel({ hunt }: { hunt: Hunt }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sdkRef = useRef<PlayerSDK | null>(null);

  const handleIframeLoad = () => {
    if (!iframeRef.current) return;

    // Create SDK instance
    sdkRef.current = new PlayerSDK(iframeRef.current);

    // Wait for Player to be ready
    sdkRef.current.onReady(() => {
      sdkRef.current?.renderHunt(hunt);
    });

    // Listen for events
    sdkRef.current.onMessage((msg) => {
      if (msg.type === PLAYER_MESSAGES.STEP_VALIDATED) {
        console.log('Validated:', msg.isCorrect);
      }
    });
  };

  // Update when hunt changes
  useEffect(() => {
    sdkRef.current?.renderHunt(hunt);
  }, [hunt]);

  // Cleanup
  useEffect(() => {
    return () => sdkRef.current?.destroy();
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/preview"
      onLoad={handleIframeLoad}
    />
  );
}
```

## API

### Constants

```typescript
EDITOR_MESSAGES.RENDER_HUNT    // Editor sends hunt data
EDITOR_MESSAGES.JUMP_TO_STEP   // Editor navigates to step

PLAYER_MESSAGES.PREVIEW_READY  // Player signals ready
PLAYER_MESSAGES.STEP_VALIDATED // Player reports validation result
```

### Message Factories

```typescript
// Editor → Player (used internally by PlayerSDK)
editorMessages.renderHunt(hunt: Hunt)
editorMessages.jumpToStep(stepIndex: number)

// Player → Editor
playerMessages.previewReady()
playerMessages.stepValidated(isCorrect: boolean, feedback: string)
```

### PlayerSDK Class

```typescript
class PlayerSDK {
  constructor(iframe: HTMLIFrameElement, targetOrigin?: string)

  // Commands (Editor → Player)
  renderHunt(hunt: Hunt): void
  jumpToStep(stepIndex: number): void

  // Events (Player → Editor)
  onMessage(callback: PlayerEventCallback): () => void  // returns unsubscribe
  onReady(callback: () => void): () => void             // convenience for PREVIEW_READY

  // Cleanup
  destroy(): void
}
```

### Types

```typescript
type EditorToPlayerMessage =
  | { type: 'RENDER_HUNT'; hunt: Hunt }
  | { type: 'JUMP_TO_STEP'; stepIndex: number }

type PlayerToEditorMessage =
  | { type: 'PREVIEW_READY' }
  | { type: 'STEP_VALIDATED'; isCorrect: boolean; feedback: string }

type PlayerEventCallback = (message: PlayerToEditorMessage) => void
```

## Message Flow

```
Editor                          Player (/preview)
   │                                │
   │──── iframe loads ─────────────►│
   │                                │
   │◄─── PREVIEW_READY ────────────│
   │                                │
   │──── RENDER_HUNT ─────────────►│
   │                                │
   │──── JUMP_TO_STEP ────────────►│
   │                                │
   │◄─── STEP_VALIDATED ───────────│
   │                                │
```

## Security

The `targetOrigin` parameter (default `'*'`) controls which origins can receive messages. In production, specify the exact origin:

```typescript
new PlayerSDK(iframe, 'https://player.hunthub.com')
```
