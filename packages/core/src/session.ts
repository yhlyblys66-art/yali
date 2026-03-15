import { nanoid } from 'nanoid';

export interface SessionState {
  id: string;
  agentId: string;
  status: 'initializing' | 'active' | 'paused' | 'terminated';
  startedAt: string;
  metadata: Record<string, any>;
}

export class Session {
  readonly id: string;
  readonly agentId: string;
  private state: SessionState;

  constructor(agentId: string) {
    this.id = `sess_${nanoid(12)}`;
    this.agentId = agentId;
    this.state = {
      id: this.id,
      agentId,
      status: 'initializing',
      startedAt: new Date().toISOString(),
      metadata: {},
    };
  }

  async initialize(): Promise<void> {
    this.state.status = 'active';
  }

  async teardown(): Promise<void> {
    this.state.status = 'terminated';
  }

  getState(): Readonly<SessionState> {
    return Object.freeze({ ...this.state });
  }

  setMetadata(key: string, value: any): void {
    this.state.metadata[key] = value;
  }

  pause(): void {
    this.state.status = 'paused';
  }

  resume(): void {
    this.state.status = 'active';
  }
}
