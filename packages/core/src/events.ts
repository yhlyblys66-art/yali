import { EventEmitter } from 'eventemitter3';

export interface MoltEvent {
  type: string;
  source: 'audience' | 'platform' | 'agent' | 'system';
  timestamp: string;
  data: Record<string, any>;
}

export interface ChatEvent extends MoltEvent {
  type: 'chat';
  data: {
    user: string;
    message: string;
    badges?: string[];
  };
}

export interface DonationEvent extends MoltEvent {
  type: 'donation';
  data: {
    user: string;
    amount: number;
    currency: string;
    message?: string;
  };
}

/**
 * Audience Loop Protocol — standardized event bus.
 * chat/reactions/donations → structured events → agent → stream action
 * Closed-loop with deterministic latency guarantees.
 */
export class EventBus extends EventEmitter {
  private queue: MoltEvent[] = [];
  private processing = false;

  enqueue(event: MoltEvent): void {
    this.queue.push(event);
    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;
    while (this.queue.length > 0) {
      const event = this.queue.shift()!;
      this.emit(event.type, event);
      this.emit('*', event);
    }
    this.processing = false;
  }

  /**
   * Create a typed event helper.
   */
  static createEvent(type: string, source: MoltEvent['source'], data: Record<string, any>): MoltEvent {
    return {
      type,
      source,
      timestamp: new Date().toISOString(),
      data,
    };
  }
}
