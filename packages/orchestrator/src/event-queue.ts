import type { MoltEvent } from '@moltstream/core';

export interface QueuedEvent {
  event: MoltEvent;
  priority: number;
  enqueuedAt: string;
}

export class EventQueue {
  private queue: QueuedEvent[] = [];
  private maxDepth: number;

  constructor(maxDepth = 1000) {
    this.maxDepth = maxDepth;
  }

  push(event: MoltEvent, priority = 0): void {
    if (this.queue.length >= this.maxDepth) {
      this.queue.shift(); // drop oldest
    }
    this.queue.push({
      event,
      priority,
      enqueuedAt: new Date().toISOString(),
    });
    // Sort by priority (higher first)
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  drain(n: number): MoltEvent[] {
    const batch = this.queue.splice(0, n);
    return batch.map((q) => q.event);
  }

  peek(): MoltEvent | null {
    return this.queue[0]?.event ?? null;
  }

  get size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }
}
