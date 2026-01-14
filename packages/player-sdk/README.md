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
      // message.hunt: HuntMetaPF (sanitized metadata)
      // message.steps: StepPF[] (sanitized steps, no answers)
      renderHunt(message.hunt, message.steps);
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
import { PlayerSDK, PlayerExporter, PLAYER_MESSAGES } from '@hunthub/player-sdk';
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
      // IMPORTANT: Use PlayerExporter to sanitize data before sending!
      const previewData = {
        hunt: PlayerExporter.hunt(hunt.huntId, hunt),
        steps: PlayerExporter.steps(hunt.steps ?? []),
      };
      sdkRef.current?.renderHunt(previewData);
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
    if (sdkRef.current && hunt) {
      const previewData = {
        hunt: PlayerExporter.hunt(hunt.huntId, hunt),
        steps: PlayerExporter.steps(hunt.steps ?? []),
      };
      sdkRef.current.renderHunt(previewData);
    }
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
EDITOR_MESSAGES.RENDER_HUNT    // Editor sends sanitized hunt data
EDITOR_MESSAGES.JUMP_TO_STEP   // Editor navigates to step

PLAYER_MESSAGES.PREVIEW_READY  // Player signals ready
PLAYER_MESSAGES.STEP_VALIDATED // Player reports validation result
```

### Types

```typescript
// Player-safe preview data (no answers exposed)
interface PreviewData {
  hunt: HuntMetaPF;   // Sanitized hunt metadata
  steps: StepPF[];    // Sanitized steps (no answers, no AI instructions)
}

type EditorToPlayerMessage =
  | { type: 'RENDER_HUNT'; hunt: HuntMetaPF; steps: StepPF[] }
  | { type: 'JUMP_TO_STEP'; stepIndex: number }

type PlayerToEditorMessage =
  | { type: 'PREVIEW_READY' }
  | { type: 'STEP_VALIDATED'; isCorrect: boolean; feedback: string }

type PlayerEventCallback = (message: PlayerToEditorMessage) => void
```

### Message Factories

```typescript
// Editor → Player (used internally by PlayerSDK)
editorMessages.renderHunt(data: PreviewData)
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
  renderHunt(data: PreviewData): void  // Send sanitized data
  jumpToStep(stepIndex: number): void

  // Events (Player → Editor)
  onMessage(callback: PlayerEventCallback): () => void  // returns unsubscribe
  onReady(callback: () => void): () => void             // convenience for PREVIEW_READY

  // Cleanup
  destroy(): void
}
```

## Message Flow

```
Editor                          Player (/preview)
   │                                │
   │──── iframe loads ─────────────►│
   │                                │
   │◄─── PREVIEW_READY ────────────│
   │                                │
   │  PlayerExporter.hunt()         │
   │  PlayerExporter.steps()        │
   │        │                       │
   │        ▼                       │
   │──── RENDER_HUNT ─────────────►│  (sanitized data, no answers)
   │     { hunt, steps }            │
   │                                │
   │──── JUMP_TO_STEP ────────────►│
   │                                │
   │◄─── STEP_VALIDATED ───────────│
   │                                │
```

## Security

### Data Sanitization

**Always use `PlayerExporter` before sending hunt data!**

The `PlayerExporter` strips sensitive information:
- Quiz answers (`targetId`, `expectedAnswer`)
- Mission target locations
- AI instructions and model configuration

This prevents answers from being visible in browser DevTools.

```typescript
import { PlayerExporter } from '@hunthub/shared';

// ✅ CORRECT - sanitized
const previewData = {
  hunt: PlayerExporter.hunt(hunt.huntId, hunt),
  steps: PlayerExporter.steps(hunt.steps ?? []),
};
sdk.renderHunt(previewData);

// ❌ WRONG - exposes answers in DevTools
// sdk.renderHunt({ hunt, steps: hunt.steps });
```

### Origin Security

The `targetOrigin` parameter (default `'*'`) controls which origins can receive messages. In production, specify the exact origin:

```typescript
new PlayerSDK(iframe, 'https://player.hunthub.com')
```
