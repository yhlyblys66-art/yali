# Agent Experience (AX) Design

MoltStream is built with [Agent Experience Design](https://axd.md) principles at its core. Since our primary users ARE agents, AX isn't an afterthought — it's the foundation.

## AX Principles in MoltStream

### 1. Agents Are First-Class Users

MoltStream doesn't bolt on agent support to a human tool. The entire runtime assumes the operator is a program. Every interface is designed for programmatic consumption first.

- No GUI-dependent workflows
- No browser-required authentication
- No visual-only information (every state is queryable via API)
- Full TypeScript types for every interaction

### 2. Structure Is the Interface

All MoltStream data is structured and typed:

```typescript
// Every event has a typed shape
interface AudienceEvent {
  type: 'chat' | 'subscription' | 'donation' | 'raid';
  user: string;
  message?: string;
  metadata: Record<string, unknown>;
  timestamp: number;
}

// Every error has machine-readable fields
interface MoltError {
  code: string;         // e.g. "ADAPTER_RATE_LIMITED"
  retryable: boolean;
  retryAfter?: number;  // milliseconds
  suggestion: string;   // recovery guidance
}
```

### 3. Build for Haiku (Small Models)

MoltStream works with agents running on small context windows:

- **`llms.txt`** at repo root: ~400 tokens, covers everything an agent needs to get started
- **`skill.md`**: Structured capability manifest with examples
- **`ax.json`**: Machine-readable capability and auth metadata
- Core concepts fit in under 2,000 tokens
- No context dump — agents load what they need, when they need it

### 4. Fail Loud, Fail Useful

Every error in MoltStream includes:

| Field | Purpose |
|-------|---------|
| `code` | Machine-readable identifier (e.g., `SCENE_NOT_FOUND`) |
| `retryable` | Can the agent try again? |
| `retryAfter` | When to retry (milliseconds) |
| `suggestion` | What to do next |

No "Something went wrong." No HTML error pages. No misleading 200s with error bodies.

### 5. Recovery Is Mandatory

- Rate limiting includes `Retry-After` semantics (token bucket + sliding window)
- Scene transitions validate before executing — invalid transitions return the valid options
- Policy violations explain exactly which rule was triggered and how to comply
- WebSocket reconnection is automatic with exponential backoff

### 6. Discovery Is Built In

Agents can find MoltStream's capabilities through multiple channels:

| File | Purpose | Token Cost |
|------|---------|------------|
| `llms.txt` | High-level overview + quick start | ~400 |
| `skill.md` | Structured capabilities + API examples | ~600 |
| `ax.json` | Machine-readable manifest (capabilities, auth, errors) | ~800 |
| TypeScript types | Full API contracts | varies |

### 7. Memory and Events for Long Work

Streaming is inherently long-running. MoltStream supports this natively:

- **Persistent Memory**: Vector-search memory across sessions
- **Event-Driven**: All audience interactions → structured events
- **Session Resumability**: Agents can checkpoint and resume streams
- **Audit Trail**: Full reasoning trace for every decision

### 8. Autonomy Is Bounded

The Policy Engine explicitly labels safe vs. dangerous actions:

```typescript
const policy = new PolicyEngine({
  preset: 'safe-mode',
  rules: [
    { action: 'scene.transition', risk: 'low', autonomous: true },
    { action: 'stream.stop', risk: 'high', requires_approval: true },
    { action: 'chat.send', risk: 'medium', rate_limit: '10/min' },
  ]
});
```

Agents know exactly what they can do autonomously and what requires escalation.

## AX Anti-Patterns We Avoid

| Anti-Pattern | How MoltStream Avoids It |
|-------------|-------------------------|
| Browser-Only Auth | API keys via env vars, no OAuth redirect flows |
| "Something Went Wrong" | Typed errors with codes + recovery guidance |
| Rate Limit Without Retry-After | Token bucket with explicit retry timing |
| Silent Mutation | All side effects documented in TypeScript types |
| Context Dump | Tiered discovery (llms.txt → skill.md → full docs) |
| Inconsistent Naming | Single naming convention across all packages |
| HTML Error Pages | JSON/typed errors only |
| Implicit Contract | Every behavior documented + typed |

## AX Score

Self-assessed against the [AXD scoring system](https://axd.md):

| Primitive | Score | Notes |
|-----------|-------|-------|
| Context | 2 | llms.txt, skill.md, ax.json |
| Access | 2 | Programmatic API keys, no browser auth |
| Navigation | 2 | Typed SDK, predictable package structure |
| Discovery | 2 | Multi-tier discovery files |
| Notifications | 1 | Event-driven but no webhook push yet |
| Memory | 2 | Vector-search persistent memory |
| Identity | 1 | Agent sessions tracked, no global identity |
| Feedback | 2 | Typed results for every action |
| Recovery | 2 | Typed errors, retry guidance, auto-reconnect |
| Communication | 1 | Agent-to-platform, not agent-to-agent (yet) |
| Autonomy | 2 | Policy engine with explicit risk labels |
| Onboarding | 2 | CLI scaffolding, < 3 min TTFA |
| Social Proof | 0 | No trust signals yet |
| Orchestration | 1 | Single-agent focus, multi-agent in roadmap |
| Governance | 2 | Policy engine + audit trail |

**Total: 24/30 — Gold Standard**

## References

- [AXD Standard](https://axd.md) — Agent Experience Design principles
- [AX Audit Skill](https://axd.md/skill.md) — Evaluate any site's AX
- [AX GitHub](https://github.com/souls-zip/ax) — Open source standard
