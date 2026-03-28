import { describe, it, expect } from 'vitest';
import { ChatAnalytics } from '../analytics.js';

describe('ChatAnalytics', () => {
  it('tracks unique chatters', () => {
    const a = new ChatAnalytics();
    a.recordMessage('u1', 'alice', 'hello');
    a.recordMessage('u2', 'bob', 'hey');
    a.recordMessage('u1', 'alice', 'sup');
    expect(a.uniqueChatterCount).toBe(2);
  });

  it('builds chatter profiles', () => {
    const a = new ChatAnalytics();
    a.recordMessage('u1', 'alice', 'hi');    // len 2
    a.recordMessage('u1', 'alice', 'hello'); // len 5
    const profile = a.getChatter('u1');
    expect(profile).toBeDefined();
    expect(profile!.messageCount).toBe(2);
    expect(profile!.avgMessageLength).toBe(3.5);
  });

  it('tracks engagement hits', () => {
    const a = new ChatAnalytics();
    a.recordMessage('u1', 'alice', 'tell me a joke');
    a.recordResponse('u1');
    a.recordResponse('u1');
    const profile = a.getChatter('u1');
    expect(profile!.engagementHits).toBe(2);
  });

  it('produces a session summary', () => {
    const a = new ChatAnalytics();
    a.recordMessage('u1', 'alice', 'yo');
    a.recordMessage('u2', 'bob', 'hey');
    a.recordMessage('u3', 'charlie', 'sup');
    a.recordResponse();

    const summary = a.summary();
    expect(summary.totalMessages).toBe(3);
    expect(summary.uniqueChatters).toBe(3);
    expect(summary.totalResponses).toBe(1);
    expect(summary.topChatters.length).toBe(3);
  });

  it('returns current engagement window', () => {
    const a = new ChatAnalytics({ windowMs: 60_000 });
    a.recordMessage('u1', 'alice', 'test');
    const window = a.currentEngagement();
    expect(window).toBeDefined();
    expect(window!.messageCount).toBe(1);
    expect(window!.uniqueChatters).toBe(1);
  });

  it('resets cleanly', () => {
    const a = new ChatAnalytics();
    a.recordMessage('u1', 'alice', 'test');
    a.recordResponse();
    a.reset();
    expect(a.uniqueChatterCount).toBe(0);
    const s = a.summary();
    expect(s.totalMessages).toBe(0);
    expect(s.totalResponses).toBe(0);
  });
});
