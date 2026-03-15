import type { SceneGraph, MoltEvent } from '@moltstream/core';
import { StateMachine, type StateDefinition } from './state-machine.js';
import { EventQueue } from './event-queue.js';

export interface OrchestratorConfig {
  sceneGraph: SceneGraph;
  states: StateDefinition[];
  tickRate?: number; // ms between orchestration ticks
  maxQueueDepth?: number;
}

/**
 * Controls streaming sessions and event flows with deterministic execution.
 * The orchestrator is the bridge between agent decisions and stream output.
 */
export class Orchestrator {
  private config: OrchestratorConfig;
  private stateMachine: StateMachine;
  private eventQueue: EventQueue;
  private running = false;
  private tickInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.stateMachine = new StateMachine(config.states);
    this.eventQueue = new EventQueue(config.maxQueueDepth ?? 1000);
  }

  async start(): Promise<void> {
    this.running = true;
    const tickRate = this.config.tickRate ?? 100;

    this.tickInterval = setInterval(() => {
      if (this.running) this.tick();
    }, tickRate);
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  enqueue(event: MoltEvent): void {
    this.eventQueue.push(event);
  }

  private tick(): void {
    const events = this.eventQueue.drain(10);
    for (const event of events) {
      const transition = this.stateMachine.process(event);
      if (transition) {
        this.config.sceneGraph.transition(transition.target, 'cut');
      }
    }
  }

  getState(): string {
    return this.stateMachine.current();
  }

  getQueueDepth(): number {
    return this.eventQueue.size;
  }
}
