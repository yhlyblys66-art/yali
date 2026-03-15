export interface ReasoningTrace {
  timestamp: string;
  session_id: string;
  trigger: {
    type: string;
    user?: string;
    message?: string;
  };
  reasoning: {
    considered: string[];
    selected: string;
    confidence: number;
    latency_ms: number;
  };
  action: {
    type: string;
    target?: string;
    data?: Record<string, any>;
  };
}

export interface AuditConfig {
  storage: 'memory' | 'file' | 'stdout';
  maxTraces?: number;
  realTimeStream?: boolean;
}

/**
 * Audit Logger — transparent logs of agent reasoning.
 * Every decision has a trace. No black boxes.
 */
export class AuditLogger {
  private traces: ReasoningTrace[] = [];
  private config: AuditConfig;

  constructor(config: AuditConfig = { storage: 'memory' }) {
    this.config = config;
  }

  log(trace: ReasoningTrace): void {
    this.traces.push(trace);

    if (this.config.maxTraces && this.traces.length > this.config.maxTraces) {
      this.traces = this.traces.slice(-this.config.maxTraces);
    }

    if (this.config.storage === 'stdout' || this.config.realTimeStream) {
      console.log(JSON.stringify(trace));
    }
  }

  query(filter?: {
    sessionId?: string;
    actionType?: string;
    minConfidence?: number;
    since?: string;
  }): ReasoningTrace[] {
    let results = [...this.traces];

    if (filter?.sessionId) {
      results = results.filter((t) => t.session_id === filter.sessionId);
    }
    if (filter?.actionType) {
      results = results.filter((t) => t.action.type === filter.actionType);
    }
    if (filter?.minConfidence) {
      results = results.filter((t) => t.reasoning.confidence >= filter.minConfidence!);
    }
    if (filter?.since) {
      results = results.filter((t) => t.timestamp >= filter.since!);
    }

    return results;
  }

  metrics(): {
    total: number;
    avgLatency: number;
    avgConfidence: number;
    actionDistribution: Record<string, number>;
  } {
    const total = this.traces.length;
    if (total === 0) return { total: 0, avgLatency: 0, avgConfidence: 0, actionDistribution: {} };

    const avgLatency = this.traces.reduce((s, t) => s + t.reasoning.latency_ms, 0) / total;
    const avgConfidence = this.traces.reduce((s, t) => s + t.reasoning.confidence, 0) / total;

    const actionDistribution: Record<string, number> = {};
    for (const t of this.traces) {
      actionDistribution[t.action.type] = (actionDistribution[t.action.type] ?? 0) + 1;
    }

    return { total, avgLatency: Math.round(avgLatency), avgConfidence: +avgConfidence.toFixed(3), actionDistribution };
  }

  clear(): void {
    this.traces = [];
  }
}
