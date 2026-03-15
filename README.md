<p align="center">
  <img src="https://moltstream.app/logo.svg" alt="MoltStream" width="80" />
</p>

<h1 align="center">MoltStream</h1>

<p align="center">
  <strong>The streaming runtime built for agents, not humans.</strong>
</p>

<p align="center">
  <a href="https://moltstream.app">Website</a> ·
  <a href="https://moltstream.app/framework">Architecture</a> ·
  <a href="#quickstart">Quickstart</a> ·
  <a href="https://github.com/skaggsxyz/moltstream/issues">Issues</a>
</p>

---

## Why MoltStream?

OBS, Streamlabs, vMix — every streaming tool assumes a human operator behind a mouse and keyboard.

MoltStream doesn't.

MoltStream is an **API-first streaming runtime** where the broadcaster is a program. No GUI. No mouse. No human in the loop (unless you want one).

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Agent Core  │────▸│ Orchestrator │────▸│ Platform Adapter │
│  (your AI)   │◂────│  (molt-orch) │◂────│  (Twitch/YT/...)│
└─────────────┘     └──────────────┘     └─────────────────┘
       │                    │                       │
       ▼                    ▼                       ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Action Bridge│     │ Policy Engine│     │  Audit Logger    │
│  (serialize) │     │  (guardrails)│     │  (traces/metrics)│
└─────────────┘     └──────────────┘     └─────────────────┘
```

## Core Concepts

### Deterministic Scene Graph
Agents don't "click buttons" to switch scenes. They operate on a **computed scene graph** — every frame is a pure function of inputs (chat, time, metrics, agent state). Reproducible. Debuggable. Testable.

### Reactive Stream Composition
Streams are composed from declarative layers — video feeds, overlays, audio, TTS — assembled in real-time. Think React, but for live video. Describe what's on screen; the runtime renders it.

### Audience Loop Protocol
Standardized feedback loop: chat → structured events → agent decision → stream action. Closed-loop with deterministic latency guarantees. Your agent reacts to the audience in milliseconds, not seconds.

### Persistent Agent Memory
Agents remember past streams, viewer preferences, what worked, what bombed. Not "every stream from scratch" — continuous learning across sessions.

## Quickstart

```bash
npm install -g @moltstream/cli

# Initialize a new agent project
molt init my-agent

# Run locally with mock platform
cd my-agent
molt dev

# Connect to Twitch
molt stream --platform twitch --key YOUR_STREAM_KEY
```

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@moltstream/core`](./packages/core) | Agent runtime — WebSocket sessions, lifecycle, state | `beta` |
| [`@moltstream/orchestrator`](./packages/orchestrator) | Scene graph engine, event queue, deterministic execution | `beta` |
| [`@moltstream/adapters`](./packages/adapters) | Platform adapters (Twitch, YouTube, Kick) | `alpha` |
| [`@moltstream/bridge`](./packages/bridge) | Action serialization, priority queuing, rollback | `beta` |
| [`@moltstream/policy`](./packages/policy) | Content filtering, permissions, emergency stop | `beta` |
| [`@moltstream/audit`](./packages/audit) | Reasoning traces, decision logs, performance metrics | `alpha` |
| [`@moltstream/cli`](./packages/cli) | CLI tooling — `molt init`, `molt dev`, `molt stream` | `beta` |

## Architecture

MoltStream separates **what to stream** (agent decisions) from **how to stream** (platform mechanics).

Your agent code talks to the **Orchestrator** through a typed SDK. The Orchestrator manages the scene graph, event queue, and state machine. **Platform Adapters** handle the actual streaming — RTMP, WebRTC, chat APIs — so your agent never touches platform-specific code.

The **Policy Engine** runs in parallel, enforcing content rules and rate limits. If your agent tries something disallowed, the policy layer intercepts before it reaches the platform. **Emergency stop** kills the stream in <100ms.

**Audit Logger** captures every reasoning iteration — what the agent considered, what it chose, why. Full decision trace for debugging and compliance.

```typescript
import { MoltAgent, SceneGraph } from '@moltstream/core';
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

## Reasoning Traces

Every agent decision is logged as a structured trace:

```json
{
  "timestamp": "2026-03-15T14:32:01.234Z",
  "session_id": "sess_abc123",
  "trigger": { "type": "chat", "user": "viewer42", "message": "play something chill" },
  "reasoning": {
    "considered": ["switch_to_chill_scene", "adjust_music", "acknowledge_in_chat"],
    "selected": "switch_to_chill_scene",
    "confidence": 0.89,
    "latency_ms": 12
  },
  "action": { "type": "scene_transition", "target": "lofi_ambient" }
}
```

## Roadmap

- [x] Core agent runtime
- [x] Twitch adapter
- [x] Policy engine v1
- [x] Reasoning trace logger
- [ ] YouTube adapter
- [ ] Kick adapter
- [ ] Multi-agent coordination protocol
- [ ] Visual scene graph editor
- [ ] Plugin marketplace

## Philosophy

1. **Agents are first-class broadcasters.** Not scripts that automate a human UI.
2. **Streaming is computation.** Every frame is a function. Every transition is a state change.
3. **Transparency by default.** If an agent makes a decision, there's a trace.
4. **Safety is not optional.** Policy engine is not a plugin — it's core infrastructure.

## License

MIT — see [LICENSE](./LICENSE)
