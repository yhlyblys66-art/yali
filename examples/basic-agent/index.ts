/**
 * Basic MoltStream agent — reacts to chat, transitions scenes.
 *
 * Usage:
 *   npx tsx examples/basic-agent/index.ts
 */

import { MoltAgent, SceneGraph } from '@moltstream/core';
import { MockAdapter } from '@moltstream/adapters';
import { PolicyEngine } from '@moltstream/policy';
import { AuditLogger } from '@moltstream/audit';

const agent = new MoltAgent({
  adapter: new MockAdapter(),
  policy: new PolicyEngine({ preset: 'safe-mode' }),
  traces: true,
});

const audit = new AuditLogger({ storage: 'stdout', realTimeStream: true });

// Register scenes
const sg = new SceneGraph();
sg.register({ id: 'intro', type: 'composite', layers: [] });
sg.register({ id: 'main', type: 'composite', layers: [] });
sg.register({ id: 'chill', type: 'composite', layers: [] });

// React to chat
agent.onAudienceEvent('chat', async (event, ctx) => {
  const message = event.data.message?.toLowerCase() ?? '';

  let targetScene = ctx.sceneGraph.current();
  if (message.includes('chill')) targetScene = 'chill';
  if (message.includes('hype')) targetScene = 'main';
  if (message.includes('intro')) targetScene = 'intro';

  if (targetScene !== ctx.sceneGraph.current()) {
    ctx.sceneGraph.transition(targetScene, 'fade', 500);

    audit.log({
      timestamp: new Date().toISOString(),
      session_id: ctx.session.id,
      trigger: { type: 'chat', user: event.data.user, message: event.data.message },
      reasoning: {
        considered: ['chill', 'main', 'intro'],
        selected: targetScene,
        confidence: 0.92,
        latency_ms: 8,
      },
      action: { type: 'scene_transition', target: targetScene },
    });
  }

  // Store in memory
  ctx.memory.store({
    sessionId: ctx.session.id,
    type: 'audience',
    data: { user: event.data.user, message: event.data.message },
  });
});

agent.on('started', () => console.log('🟢 Agent is live'));
agent.on('stopped', () => console.log('🔴 Agent stopped'));

agent.start().catch(console.error);
