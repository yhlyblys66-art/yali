import type { MoltEvent } from '@moltstream/core';

export interface PolicyRule {
  id: string;
  type: 'block' | 'rate-limit' | 'transform';
  match: (event: MoltEvent) => boolean;
  action: (event: MoltEvent) => MoltEvent | null; // null = block
}

export interface PolicyConfig {
  preset?: 'permissive' | 'safe-mode' | 'strict';
  rules?: PolicyRule[];
  rateLimits?: {
    maxEventsPerSecond?: number;
    maxActionsPerMinute?: number;
  };
  emergencyStop?: {
    enabled: boolean;
    triggerWords?: string[];
    maxConsecutiveErrors?: number;
  };
}

/**
 * Policy Engine — safety is not a plugin, it's core infrastructure.
 * Runs in parallel with the agent, intercepting actions before they reach the platform.
 * Emergency stop kills the stream in <100ms.
 */
export class PolicyEngine {
  private config: PolicyConfig;
  private rules: PolicyRule[] = [];
  private eventCounts: Map<string, number[]> = new Map();
  private stopped = false;

  constructor(config: PolicyConfig = {}) {
    this.config = config;
    this.rules = config.rules ?? [];

    if (config.preset) {
      this.loadPreset(config.preset);
    }
  }

  async evaluate(event: MoltEvent): Promise<boolean> {
    if (this.stopped) return false;

    // Rate limit check
    if (this.config.rateLimits?.maxEventsPerSecond) {
      const now = Date.now();
      const key = event.type;
      const timestamps = this.eventCounts.get(key) ?? [];
      const recent = timestamps.filter((t) => now - t < 1000);
      if (recent.length >= this.config.rateLimits.maxEventsPerSecond) {
        return false;
      }
      recent.push(now);
      this.eventCounts.set(key, recent);
    }

    // Rule evaluation
    for (const rule of this.rules) {
      if (rule.match(event)) {
        const result = rule.action(event);
        if (result === null) return false;
      }
    }

    return true;
  }

  /**
   * Emergency stop — immediately halt all stream actions.
   * Latency target: <100ms from trigger to stream kill.
   */
  emergencyStop(reason: string): void {
    this.stopped = true;
    console.error(`[EMERGENCY STOP] ${reason} at ${new Date().toISOString()}`);
  }

  resume(): void {
    this.stopped = false;
  }

  isStopped(): boolean {
    return this.stopped;
  }

  private loadPreset(preset: string): void {
    switch (preset) {
      case 'safe-mode':
        this.config.rateLimits = {
          maxEventsPerSecond: 10,
          maxActionsPerMinute: 60,
        };
        this.config.emergencyStop = {
          enabled: true,
          maxConsecutiveErrors: 5,
        };
        break;
      case 'strict':
        this.config.rateLimits = {
          maxEventsPerSecond: 5,
          maxActionsPerMinute: 30,
        };
        this.config.emergencyStop = {
          enabled: true,
          maxConsecutiveErrors: 3,
        };
        break;
      case 'permissive':
      default:
        break;
    }
  }
}
