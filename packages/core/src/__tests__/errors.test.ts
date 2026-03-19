import { describe, it, expect } from 'vitest';
import { MoltError, Errors } from '../errors.js';

describe('MoltError', () => {
  it('creates error with all required fields', () => {
    const err = new MoltError({
      code: 'TEST_ERROR',
      message: 'something broke',
      category: 'adapter',
      severity: 'error',
      retryable: true,
      retryAfter: 3000,
      suggestion: 'try again later',
    });

    expect(err.code).toBe('TEST_ERROR');
    expect(err.message).toBe('something broke');
    expect(err.category).toBe('adapter');
    expect(err.severity).toBe('error');
    expect(err.retryable).toBe(true);
    expect(err.retryAfter).toBe(3000);
    expect(err.suggestion).toBe('try again later');
    expect(err.timestamp).toBeGreaterThan(0);
    expect(err).toBeInstanceOf(Error);
  });

  it('serializes to agent-friendly JSON', () => {
    const err = new MoltError({
      code: 'JSON_TEST',
      message: 'test',
      category: 'config',
      severity: 'fatal',
      retryable: false,
      suggestion: 'fix config',
    });

    const json = err.toJSON();
    expect(json.code).toBe('JSON_TEST');
    expect(json.retryable).toBe(false);
    expect(json.suggestion).toBe('fix config');
    expect(json).not.toHaveProperty('retryAfter'); // omitted when undefined
  });

  it('includes retryAfter in JSON when set', () => {
    const err = Errors.adapterRateLimited(5000, 'twitch');
    const json = err.toJSON();

    expect(json.retryAfter).toBe(5000);
    expect(json.code).toBe('ADAPTER_RATE_LIMITED');
  });

  it('toString includes recovery guidance', () => {
    const err = Errors.sceneNotFound('missing_scene', ['intro', 'main', 'outro']);
    const str = err.toString();

    expect(str).toContain('SCENE_NOT_FOUND');
    expect(str).toContain('not retryable');
    expect(str).toContain('intro, main, outro');
  });
});

describe('Error factories', () => {
  it('adapterRateLimited is retryable with timing', () => {
    const err = Errors.adapterRateLimited(10000, 'youtube');
    expect(err.retryable).toBe(true);
    expect(err.retryAfter).toBe(10000);
    expect(err.category).toBe('rate_limit');
  });

  it('adapterAuthFailed is fatal and not retryable', () => {
    const err = Errors.adapterAuthFailed('twitch');
    expect(err.retryable).toBe(false);
    expect(err.severity).toBe('fatal');
    expect(err.category).toBe('auth');
  });

  it('sceneNotFound includes valid scenes in context', () => {
    const err = Errors.sceneNotFound('bad', ['a', 'b']);
    expect(err.context.validScenes).toEqual(['a', 'b']);
  });

  it('policyViolation includes action and rule', () => {
    const err = Errors.policyViolation('chat.send', 'no-profanity');
    expect(err.code).toBe('POLICY_VIOLATION');
    expect(err.context.action).toBe('chat.send');
    expect(err.context.rule).toBe('no-profanity');
  });

  it('configMissing is fatal with key info', () => {
    const err = Errors.configMissing('TWITCH_KEY');
    expect(err.severity).toBe('fatal');
    expect(err.suggestion).toContain('TWITCH_KEY');
  });

  it('websocketDisconnected auto-retries', () => {
    const err = Errors.websocketDisconnected('timeout');
    expect(err.retryable).toBe(true);
    expect(err.retryAfter).toBe(2000);
  });

  it('memoryWriteFailed preserves cause', () => {
    const cause = new Error('disk full');
    const err = Errors.memoryWriteFailed(cause);
    expect(err.cause).toBe(cause);
    expect(err.retryable).toBe(true);
  });
});
