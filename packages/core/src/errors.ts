/**
 * MoltStream Typed Error System
 *
 * AX Principle: "Fail loud, fail useful"
 * Every error includes machine-readable fields for agent recovery:
 * - code: Unique error identifier
 * - retryable: Whether the agent should retry
 * - retryAfter: Milliseconds to wait before retry (when applicable)
 * - suggestion: Recovery guidance for the agent
 *
 * @see https://axd.md — Agent Experience Design
 */

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

export type ErrorCategory =
  | 'adapter'
  | 'auth'
  | 'policy'
  | 'scene'
  | 'memory'
  | 'orchestrator'
  | 'rate_limit'
  | 'network'
  | 'config';

export interface MoltErrorOptions {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
  retryAfter?: number;
  suggestion: string;
  context?: Record<string, unknown>;
  cause?: Error;
}

export class MoltError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly retryable: boolean;
  readonly retryAfter?: number;
  readonly suggestion: string;
  readonly context: Record<string, unknown>;
  readonly timestamp: number;

  constructor(options: MoltErrorOptions) {
    super(options.message);
    this.name = 'MoltError';
    this.code = options.code;
    this.category = options.category;
    this.severity = options.severity;
    this.retryable = options.retryable;
    this.retryAfter = options.retryAfter;
    this.suggestion = options.suggestion;
    this.context = options.context ?? {};
    this.timestamp = Date.now();

    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Serialize to agent-friendly JSON.
   * Agents parse this directly — no HTML, no ambiguity.
   */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      severity: this.severity,
      retryable: this.retryable,
      ...(this.retryAfter !== undefined && { retryAfter: this.retryAfter }),
      suggestion: this.suggestion,
      context: this.context,
      timestamp: this.timestamp,
    };
  }

  /**
   * Create a human/agent-readable string representation.
   */
  toString(): string {
    const retry = this.retryable
      ? ` [retryable${this.retryAfter ? ` in ${this.retryAfter}ms` : ''}]`
      : ' [not retryable]';
    return `[${this.code}] ${this.message}${retry} — ${this.suggestion}`;
  }
}

// ─── Pre-defined Error Factories ─────────────────────────────────────────────

export const Errors = {
  // Adapter errors
  adapterRateLimited: (retryAfter: number, platform?: string) =>
    new MoltError({
      code: 'ADAPTER_RATE_LIMITED',
      message: `Platform rate limit exceeded${platform ? ` (${platform})` : ''}`,
      category: 'rate_limit',
      severity: 'warning',
      retryable: true,
      retryAfter,
      suggestion: 'Reduce message frequency or batch operations. Will auto-retry.',
      context: { platform },
    }),

  adapterConnectionFailed: (platform: string, cause?: Error) =>
    new MoltError({
      code: 'ADAPTER_CONNECTION_FAILED',
      message: `Failed to connect to ${platform}`,
      category: 'adapter',
      severity: 'error',
      retryable: true,
      retryAfter: 5000,
      suggestion: `Check ${platform} stream key and network connectivity. Auto-reconnect will attempt in 5s.`,
      context: { platform },
      cause,
    }),

  adapterAuthFailed: (platform: string) =>
    new MoltError({
      code: 'ADAPTER_AUTH_FAILED',
      message: `Authentication failed for ${platform}`,
      category: 'auth',
      severity: 'fatal',
      retryable: false,
      suggestion: `Verify your ${platform} stream key in environment variables. Ensure the key has not expired.`,
      context: { platform },
    }),

  // Scene errors
  sceneNotFound: (sceneId: string, validScenes: string[]) =>
    new MoltError({
      code: 'SCENE_NOT_FOUND',
      message: `Scene "${sceneId}" does not exist in the scene graph`,
      category: 'scene',
      severity: 'error',
      retryable: false,
      suggestion: `Use one of the valid scenes: ${validScenes.join(', ')}`,
      context: { sceneId, validScenes },
    }),

  sceneTransitionBlocked: (from: string, to: string, reason: string) =>
    new MoltError({
      code: 'SCENE_TRANSITION_BLOCKED',
      message: `Cannot transition from "${from}" to "${to}": ${reason}`,
      category: 'scene',
      severity: 'warning',
      retryable: false,
      suggestion: `Check scene graph rules. Transition may require intermediate scene or different state.`,
      context: { from, to, reason },
    }),

  // Policy errors
  policyViolation: (action: string, rule: string) =>
    new MoltError({
      code: 'POLICY_VIOLATION',
      message: `Action "${action}" blocked by policy rule: ${rule}`,
      category: 'policy',
      severity: 'warning',
      retryable: false,
      suggestion: `This action is not allowed under current policy. Adjust PolicyEngine rules or use a different action.`,
      context: { action, rule },
    }),

  // Memory errors
  memoryWriteFailed: (cause?: Error) =>
    new MoltError({
      code: 'MEMORY_WRITE_FAILED',
      message: 'Failed to persist data to agent memory',
      category: 'memory',
      severity: 'error',
      retryable: true,
      retryAfter: 1000,
      suggestion: 'Memory storage may be temporarily unavailable. Operation will be retried.',
      cause,
    }),

  // Config errors
  configMissing: (key: string) =>
    new MoltError({
      code: 'CONFIG_MISSING',
      message: `Required configuration "${key}" is not set`,
      category: 'config',
      severity: 'fatal',
      retryable: false,
      suggestion: `Set ${key} in your environment variables or .env file. See .env.example for reference.`,
      context: { key },
    }),

  // Network errors
  websocketDisconnected: (reason: string) =>
    new MoltError({
      code: 'WEBSOCKET_DISCONNECTED',
      message: `WebSocket connection lost: ${reason}`,
      category: 'network',
      severity: 'error',
      retryable: true,
      retryAfter: 2000,
      suggestion: 'Connection will auto-reconnect with exponential backoff.',
      context: { reason },
    }),
} as const;
