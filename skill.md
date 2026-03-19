---
name: moltstream
description: >
  AI agent-native streaming runtime. Use MoltStream to build agents that
  operate live streams — control scenes, react to chat, manage overlays,
  and broadcast to Twitch/YouTube/Kick. All through a typed SDK, no GUI.
capabilities:
  - stream-management
  - scene-composition
  - chat-reaction
  - audience-analytics
  - multi-platform-broadcast
  - reasoning-trace-logging
context_cost: 400
ttfa_minutes: 3
min_context_window: 8000
auth: api-key
---

# MoltStream Skill

## What you can do
- Initialize and run an AI-powered live stream
- Compose scenes declaratively (video, overlays, audio, TTS)
- React to audience events (chat, subscriptions, donations)
- Switch between platforms (Twitch, YouTube, Kick) with zero code changes
- Enforce content policies and safety guardrails
- Log every decision as a structured reasoning trace
- Persist memory across streaming sessions

## Quick start
```bash
npm install -g @moltstream/cli
molt init my-agent
cd my-agent
molt dev                    # local dev with mock platform
molt stream --platform twitch --key $TWITCH_KEY  # go live
```

## Core API
```typescript
import { MoltAgent } from '@moltstream/core';
import { TwitchAdapter } from '@moltstream/adapters';
import { PolicyEngine } from '@moltstream/policy';

const agent = new MoltAgent({
  adapter: new TwitchAdapter({ streamKey: process.env.TWITCH_KEY }),
  policy: new PolicyEngine({ preset: 'safe-mode' }),
});

agent.onAudienceEvent('chat', async (event, ctx) => {
  const scene = await ctx.reasoning.decide({
    input: event.message,
    currentScene: ctx.sceneGraph.current(),
    history: ctx.memory.recent(10),
  });
  ctx.sceneGraph.transition(scene);
});

agent.start();
```

## Error handling
All errors are typed and include:
- `code`: Machine-readable error identifier
- `retryable`: Boolean flag
- `retryAfter`: Milliseconds until retry (when applicable)
- `suggestion`: Human/agent-readable recovery guidance

Example:
```json
{
  "code": "ADAPTER_RATE_LIMITED",
  "retryable": true,
  "retryAfter": 5000,
  "suggestion": "Reduce chat message frequency or batch messages"
}
```

## Packages
| Package | Purpose |
|---------|---------|
| @moltstream/core | Agent runtime, state, memory, telemetry |
| @moltstream/orchestrator | Scene graph, event queue |
| @moltstream/adapters | Twitch, YouTube, Kick |
| @moltstream/bridge | Action serialization, rollback |
| @moltstream/policy | Content safety, permissions |
| @moltstream/audit | Reasoning traces, metrics |
| @moltstream/cli | Project scaffolding, dev server |
| @moltstream/narrative | Narrative detection engine |
| @moltstream/container | Docker isolation for agents |

## Links
- GitHub: https://github.com/skaggsxyz/moltstream
- Docs: https://moltstream.app/framework
- Examples: https://github.com/skaggsxyz/moltstream/tree/main/examples
