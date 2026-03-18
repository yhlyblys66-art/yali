/**
 * Rate Limiter
 *
 * Token bucket + sliding window rate limiting for agent actions.
 * Prevents agents from overwhelming external APIs, chat platforms,
 * or internal reasoning engines with excessive requests.
 */

export interface RateLimitConfig {
  /** Maximum tokens in bucket */
  maxTokens: number;
  /** Tokens refilled per interval */
  refillRate: number;
  /** Refill interval in milliseconds */
  refillIntervalMs: number;
}

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private config: RateLimitConfig) {
    this.tokens = config.maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Try to consume tokens. Returns true if allowed.
   */
  tryConsume(amount = 1): boolean {
    this.refill();
    if (this.tokens >= amount) {
      this.tokens -= amount;
      return true;
    }
    return false;
  }

  /**
   * Wait until tokens are available, then consume.
   */
  async waitAndConsume(amount = 1): Promise<void> {
    while (!this.tryConsume(amount)) {
      const waitMs = Math.ceil(
        (amount - this.tokens) * (this.config.refillIntervalMs / this.config.refillRate),
      );
      await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 10)));
    }
  }

  get available(): number {
    this.refill();
    return this.tokens;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const intervals = Math.floor(elapsed / this.config.refillIntervalMs);

    if (intervals > 0) {
      this.tokens = Math.min(
        this.config.maxTokens,
        this.tokens + intervals * this.config.refillRate,
      );
      this.lastRefill += intervals * this.config.refillIntervalMs;
    }
  }
}

/**
 * Sliding window counter for tracking request rates.
 */
export class SlidingWindow {
  private timestamps: number[] = [];

  constructor(
    private windowMs: number,
    private maxRequests: number,
  ) {}

  /**
   * Record a request. Returns true if within limit.
   */
  tryRecord(): boolean {
    this.prune();
    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }
    this.timestamps.push(Date.now());
    return true;
  }

  get currentRate(): number {
    this.prune();
    return this.timestamps.length;
  }

  get remaining(): number {
    this.prune();
    return Math.max(0, this.maxRequests - this.timestamps.length);
  }

  /**
   * Time in ms until next request slot opens.
   */
  get retryAfterMs(): number {
    this.prune();
    if (this.timestamps.length < this.maxRequests) return 0;
    const oldest = this.timestamps[0];
    return Math.max(0, oldest + this.windowMs - Date.now());
  }

  private prune(): void {
    const cutoff = Date.now() - this.windowMs;
    while (this.timestamps.length > 0 && this.timestamps[0] <= cutoff) {
      this.timestamps.shift();
    }
  }
}

/**
 * Composite rate limiter combining token bucket and sliding window.
 */
export class RateLimiter {
  private bucket: TokenBucket;
  private window: SlidingWindow;

  constructor(
    bucketConfig: RateLimitConfig,
    windowMs: number,
    maxRequestsPerWindow: number,
  ) {
    this.bucket = new TokenBucket(bucketConfig);
    this.window = new SlidingWindow(windowMs, maxRequestsPerWindow);
  }

  /**
   * Check if a request is allowed (both bucket and window).
   */
  tryAcquire(): boolean {
    if (!this.window.tryRecord()) return false;
    if (!this.bucket.tryConsume()) return false;
    return true;
  }

  get status(): {
    bucketTokens: number;
    windowRate: number;
    windowRemaining: number;
    retryAfterMs: number;
  } {
    return {
      bucketTokens: this.bucket.available,
      windowRate: this.window.currentRate,
      windowRemaining: this.window.remaining,
      retryAfterMs: this.window.retryAfterMs,
    };
  }
}

/**
 * Per-key rate limiter (e.g., per-user, per-platform).
 */
export class KeyedRateLimiter {
  private limiters = new Map<string, RateLimiter>();

  constructor(
    private bucketConfig: RateLimitConfig,
    private windowMs: number,
    private maxRequestsPerWindow: number,
  ) {}

  tryAcquire(key: string): boolean {
    if (!this.limiters.has(key)) {
      this.limiters.set(
        key,
        new RateLimiter(this.bucketConfig, this.windowMs, this.maxRequestsPerWindow),
      );
    }
    return this.limiters.get(key)!.tryAcquire();
  }

  status(key: string): ReturnType<RateLimiter['status']> | null {
    return this.limiters.get(key)?.status ?? null;
  }

  /** Remove stale limiters to free memory */
  prune(): void {
    for (const [key, limiter] of this.limiters) {
      if (limiter.status.windowRate === 0 && limiter.status.bucketTokens >= this.bucketConfig.maxTokens) {
        this.limiters.delete(key);
      }
    }
  }
}
