import { describe, it, expect, beforeEach } from 'vitest';
import { TokenBucket, SlidingWindow, RateLimiter, KeyedRateLimiter } from '../src/rate-limiter.js';

describe('TokenBucket', () => {
  it('should allow consumption within limit', () => {
    const bucket = new TokenBucket({
      maxTokens: 10,
      refillRate: 1,
      refillIntervalMs: 100,
    });
    expect(bucket.tryConsume(5)).toBe(true);
    expect(bucket.available).toBe(5);
  });

  it('should reject when depleted', () => {
    const bucket = new TokenBucket({
      maxTokens: 3,
      refillRate: 1,
      refillIntervalMs: 1000,
    });
    expect(bucket.tryConsume(3)).toBe(true);
    expect(bucket.tryConsume(1)).toBe(false);
  });

  it('should not exceed max tokens', () => {
    const bucket = new TokenBucket({
      maxTokens: 5,
      refillRate: 100,
      refillIntervalMs: 1,
    });
    expect(bucket.available).toBeLessThanOrEqual(5);
  });
});

describe('SlidingWindow', () => {
  it('should allow requests within limit', () => {
    const window = new SlidingWindow(1000, 5);
    for (let i = 0; i < 5; i++) {
      expect(window.tryRecord()).toBe(true);
    }
    expect(window.tryRecord()).toBe(false);
  });

  it('should track current rate', () => {
    const window = new SlidingWindow(1000, 10);
    window.tryRecord();
    window.tryRecord();
    window.tryRecord();
    expect(window.currentRate).toBe(3);
    expect(window.remaining).toBe(7);
  });
});

describe('RateLimiter', () => {
  it('should combine bucket and window checks', () => {
    const limiter = new RateLimiter(
      { maxTokens: 5, refillRate: 1, refillIntervalMs: 1000 },
      1000,
      10,
    );
    for (let i = 0; i < 5; i++) {
      expect(limiter.tryAcquire()).toBe(true);
    }
    // bucket depleted
    expect(limiter.tryAcquire()).toBe(false);
  });

  it('should report status', () => {
    const limiter = new RateLimiter(
      { maxTokens: 10, refillRate: 1, refillIntervalMs: 1000 },
      1000,
      100,
    );
    limiter.tryAcquire();
    const status = limiter.status;
    expect(status.windowRate).toBe(1);
    expect(status.bucketTokens).toBe(9);
  });
});

describe('KeyedRateLimiter', () => {
  it('should rate limit per key independently', () => {
    const keyed = new KeyedRateLimiter(
      { maxTokens: 2, refillRate: 1, refillIntervalMs: 10000 },
      10000,
      100,
    );
    expect(keyed.tryAcquire('user-a')).toBe(true);
    expect(keyed.tryAcquire('user-a')).toBe(true);
    expect(keyed.tryAcquire('user-a')).toBe(false);
    // user-b has own limit
    expect(keyed.tryAcquire('user-b')).toBe(true);
  });
});
