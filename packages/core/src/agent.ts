import { EventEmitter } from 'eventemitter3';
import { nanoid } from 'nanoid';
import { Session, type SessionState } from './session.js';
import { SceneGraph } from './scene-graph.js';
import { AgentMemory } from './memory.js';
import { EventBus, type MoltEvent } from './events.js';
import { createLogger, type Logger } from './logger.js';

export interface MoltAgentConfig {
  /** Platform adapter instance */
  adapter: any;
  /** Policy engine instance (optional) */
  policy?: any;
  /** Agent identifier */
  agentId?: string;
  /** Enable reasoning trace logging */
  traces?: boolean;
  /** Memory persistence backend */
  memoryBackend?: 'memory' | 'sqlite' | 'redis';
  /** Maximum concurrent sessions */
  maxSessions?: number;
}

type AudienceHandler = (event: MoltEvent, ctx: AgentContext) => Promise<void>;

export interface AgentContext {
  session: Session;
  sceneGraph: SceneGraph;
  memory: AgentMemory;
  reasoning: ReasoningContext;
}

export interface ReasoningContext {
  decide(input: DecisionInput): Promise<DecisionResult>;
}

interface DecisionInput {
  input: string;
  currentScene: string;
  history: any[];
  [key: string]: any;
}

interface DecisionResult {
  action: string;
  confidence: number;
  trace: ReasoningTrace;
}

interface ReasoningTrace {
  considered: string[];
  selected: string;
  confidence: number;
  latency_ms: number;
  timestamp: string;
}

export class MoltAgent extends EventEmitter {
  readonly id: string;
  private config: MoltAgentConfig;
  private session: Session | null = null;
  private sceneGraph: SceneGraph;
  private memory: AgentMemory;
  private eventBus: EventBus;
  private handlers: Map<string, AudienceHandler[]> = new Map();
  private logger: Logger;
  private running = false;

  constructor(config: MoltAgentConfig) {
    super();
    this.id = config.agentId ?? `agent_${nanoid(8)}`;
    this.config = config;
    this.sceneGraph = new SceneGraph();
    this.memory = new AgentMemory(config.memoryBackend ?? 'memory');
    this.eventBus = new EventBus();
    this.logger = createLogger(`molt:agent:${this.id}`);
  }

  /**
   * Register a handler for audience events (chat, donation, follow, etc.)
   */
  onAudienceEvent(type: string, handler: AudienceHandler): this {
    const existing = this.handlers.get(type) ?? [];
    existing.push(handler);
    this.handlers.set(type, existing);
    return this;
  }

  /**
   * Start the agent — connects to platform, begins processing events.
   */
  async start(): Promise<void> {
    if (this.running) throw new Error('Agent already running');

    this.logger.info('Starting agent', { id: this.id });

    this.session = new Session(this.id);
    await this.session.initialize();

    // Connect to platform via adapter
    if (this.config.adapter?.connect) {
      await this.config.adapter.connect({
        onEvent: (event: MoltEvent) => this.handleEvent(event),
        session: this.session,
      });
    }

    this.running = true;
    this.emit('started', { agentId: this.id, timestamp: new Date().toISOString() });
    this.logger.info('Agent started', { id: this.id });
  }

  /**
   * Stop the agent gracefully.
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    this.logger.info('Stopping agent', { id: this.id });

    if (this.config.adapter?.disconnect) {
      await this.config.adapter.disconnect();
    }

    if (this.session) {
      await this.session.teardown();
    }

    this.running = false;
    this.emit('stopped', { agentId: this.id, timestamp: new Date().toISOString() });
  }

  private async handleEvent(event: MoltEvent): Promise<void> {
    const start = performance.now();

    // Policy check
    if (this.config.policy?.evaluate) {
      const allowed = await this.config.policy.evaluate(event);
      if (!allowed) {
        this.logger.warn('Event blocked by policy', { type: event.type, reason: 'policy_deny' });
        return;
      }
    }

    const handlers = this.handlers.get(event.type) ?? [];
    if (handlers.length === 0) return;

    const ctx: AgentContext = {
      session: this.session!,
      sceneGraph: this.sceneGraph,
      memory: this.memory,
      reasoning: this.createReasoningContext(),
    };

    for (const handler of handlers) {
      try {
        await handler(event, ctx);
      } catch (err) {
        this.logger.error('Handler error', { type: event.type, error: String(err) });
        this.emit('error', { event, error: err });
      }
    }

    const latency = performance.now() - start;
    this.emit('event_processed', { type: event.type, latency_ms: Math.round(latency) });
  }

  private createReasoningContext(): ReasoningContext {
    return {
      decide: async (input: DecisionInput): Promise<DecisionResult> => {
        const start = performance.now();
        // Reasoning logic — override with custom decision engine
        const result: DecisionResult = {
          action: 'default',
          confidence: 1.0,
          trace: {
            considered: [input.input],
            selected: 'default',
            confidence: 1.0,
            latency_ms: Math.round(performance.now() - start),
            timestamp: new Date().toISOString(),
          },
        };

        if (this.config.traces) {
          this.emit('reasoning_trace', result.trace);
        }

        return result;
      },
    };
  }
}
