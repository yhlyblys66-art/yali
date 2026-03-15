/**
 * Multi-agent debate — two agents take turns responding to audience.
 * Demonstrates agent coordination and scene handoff.
 *
 * Usage:
 *   npx tsx examples/multi-agent-debate/index.ts
 */

import { MoltAgent } from '@moltstream/core';
import { MockAdapter } from '@moltstream/adapters';

const agentA = new MoltAgent({
  adapter: new MockAdapter(),
  agentId: 'debater-alpha',
  traces: true,
});

const agentB = new MoltAgent({
  adapter: new MockAdapter(),
  agentId: 'debater-beta',
  traces: true,
});

let currentSpeaker: 'alpha' | 'beta' = 'alpha';

agentA.onAudienceEvent('chat', async (event, ctx) => {
  if (currentSpeaker !== 'alpha') return;

  console.log(`[Alpha] Responding to: ${event.data.message}`);
  // Agent A processes, then yields to Agent B
  currentSpeaker = 'beta';
});

agentB.onAudienceEvent('chat', async (event, ctx) => {
  if (currentSpeaker !== 'beta') return;

  console.log(`[Beta] Responding to: ${event.data.message}`);
  // Agent B processes, then yields to Agent A
  currentSpeaker = 'alpha';
});

Promise.all([agentA.start(), agentB.start()])
  .then(() => console.log('🎭 Multi-agent debate started'))
  .catch(console.error);
