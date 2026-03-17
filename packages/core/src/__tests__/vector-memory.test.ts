import { describe, it, expect, beforeEach } from 'vitest';
import { VectorMemory } from '../vector-memory.js';

describe('VectorMemory', () => {
  let memory: VectorMemory;

  beforeEach(() => {
    memory = new VectorMemory();
  });

  it('stores and retrieves entries', async () => {
    await memory.store({
      sessionId: 'sess_1',
      type: 'event',
      content: 'viewer asked about game mechanics',
      metadata: { viewer: 'alice' },
    });

    expect(await memory.size()).toBe(1);
  });

  it('performs semantic search', async () => {
    await memory.store({
      sessionId: 'sess_1',
      type: 'event',
      content: 'viewer asked about game mechanics and combat system',
      metadata: {},
    });
    await memory.store({
      sessionId: 'sess_1',
      type: 'decision',
      content: 'switched to cooking scene after chat vote',
      metadata: {},
    });
    await memory.store({
      sessionId: 'sess_1',
      type: 'event',
      content: 'new follower joined during game discussion',
      metadata: {},
    });

    const results = await memory.search('game mechanics', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.content).toContain('game');
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('filters by type', async () => {
    await memory.store({
      sessionId: 's1',
      type: 'event',
      content: 'viewer event happened',
      metadata: {},
    });
    await memory.store({
      sessionId: 's1',
      type: 'decision',
      content: 'agent decided to switch scene',
      metadata: {},
    });

    const results = await memory.search('event', 10, { type: 'event' });
    expect(results.every((r) => r.entry.type === 'event')).toBe(true);
  });

  it('recall produces formatted context string', async () => {
    await memory.store({
      sessionId: 's1',
      type: 'reflection',
      content: 'audience prefers interactive content over passive watching',
      metadata: {},
    });

    const ctx = await memory.recall('what does the audience like');
    expect(ctx.length).toBeGreaterThan(0);
    expect(ctx).toContain('[reflection]');
  });

  it('forget removes entries', async () => {
    const entry = await memory.store({
      sessionId: 's1',
      type: 'metric',
      content: 'peak viewers: 150',
      metadata: { peak: 150 },
    });

    expect(await memory.size()).toBe(1);
    await memory.forget(entry.id);
    expect(await memory.size()).toBe(0);
  });
});
