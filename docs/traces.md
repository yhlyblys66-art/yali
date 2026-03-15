# Reasoning Traces

Every agent decision produces a structured trace. No black boxes — every choice is logged, queryable, and auditable.

## Trace Format

```json
{
  "timestamp": "2026-03-15T14:32:01.234Z",
  "session_id": "sess_abc123def456",
  "trigger": {
    "type": "chat",
    "user": "viewer42",
    "message": "play something chill"
  },
  "reasoning": {
    "considered": ["switch_to_chill_scene", "adjust_music", "acknowledge_in_chat"],
    "selected": "switch_to_chill_scene",
    "confidence": 0.89,
    "latency_ms": 12
  },
  "action": {
    "type": "scene_transition",
    "target": "lofi_ambient"
  }
}
```

## Using the Audit Logger

```typescript
import { AuditLogger } from '@moltstream/audit';

const audit = new AuditLogger({
  storage: 'stdout',      // 'memory' | 'file' | 'stdout'
  realTimeStream: true,    // stream traces as they happen
  maxTraces: 10000,        // rolling window
});

// Log a trace
audit.log({
  timestamp: new Date().toISOString(),
  session_id: session.id,
  trigger: { type: 'chat', user: 'viewer42', message: 'hello' },
  reasoning: {
    considered: ['greet', 'ignore', 'ask_question'],
    selected: 'greet',
    confidence: 0.95,
    latency_ms: 8,
  },
  action: { type: 'chat_send', data: { message: 'Hey viewer42!' } },
});
```

## Querying Traces

```typescript
// Get traces from a specific session
const sessionTraces = audit.query({ sessionId: 'sess_abc123' });

// Get high-confidence decisions only
const confident = audit.query({ minConfidence: 0.9 });

// Get scene transitions
const transitions = audit.query({ actionType: 'scene_transition' });
```

## Metrics

```typescript
const stats = audit.metrics();
// {
//   total: 1247,
//   avgLatency: 14,          // ms
//   avgConfidence: 0.873,
//   actionDistribution: {
//     scene_transition: 89,
//     chat_send: 412,
//     audio_change: 34,
//     ...
//   }
// }
```

## CLI

```bash
# View last 20 traces
molt traces

# Export as JSON
molt traces --json --limit 100 > traces.json
```
