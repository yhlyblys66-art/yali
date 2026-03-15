# Policy Engine

Safety is not optional. The policy engine is core infrastructure — it runs in parallel with the agent, intercepting every action before it reaches the platform.

## Presets

| Preset | Max Events/s | Max Actions/min | Emergency Stop |
|--------|-------------|-----------------|----------------|
| `permissive` | unlimited | unlimited | off |
| `safe-mode` | 10 | 60 | on (5 errors) |
| `strict` | 5 | 30 | on (3 errors) |

## Usage

```typescript
import { PolicyEngine } from '@moltstream/policy';

const policy = new PolicyEngine({
  preset: 'safe-mode',
  emergencyStop: {
    enabled: true,
    triggerWords: ['nsfw', 'violence'],
    maxConsecutiveErrors: 3,
  },
});
```

## Custom Rules

```typescript
const policy = new PolicyEngine({
  rules: [
    {
      id: 'no-spam',
      type: 'rate-limit',
      match: (event) => event.type === 'chat' && event.data.message.length > 500,
      action: () => null, // block
    },
    {
      id: 'transform-caps',
      type: 'transform',
      match: (event) => event.data.message === event.data.message.toUpperCase(),
      action: (event) => ({
        ...event,
        data: { ...event.data, message: event.data.message.toLowerCase() },
      }),
    },
  ],
});
```

## Emergency Stop

The emergency stop kills the stream in <100ms:

```typescript
// Triggered automatically on consecutive errors
// Or manually:
policy.emergencyStop('Content violation detected');

// Resume after review
policy.resume();
```

Emergency stop is not a feature — it's a safety net. When it triggers, the stream goes dark immediately. No gradual fadeout. No "please wait". Dark.
