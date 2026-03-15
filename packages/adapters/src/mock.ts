import type { PlatformAdapter, AdapterCallbacks } from './types.js';
import { EventBus } from '@moltstream/core';

/**
 * Mock adapter for local development and testing.
 * Simulates audience events without a real platform connection.
 */
export class MockAdapter implements PlatformAdapter {
  readonly platform = 'mock';
  private callbacks: AdapterCallbacks | null = null;
  private live = false;
  private interval: ReturnType<typeof setInterval> | null = null;

  async connect(callbacks: AdapterCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.live = true;

    // Simulate random chat events
    this.interval = setInterval(() => {
      if (this.callbacks) {
        this.callbacks.onEvent(
          EventBus.createEvent('chat', 'audience', {
            user: `viewer_${Math.floor(Math.random() * 1000)}`,
            message: 'simulated chat message',
          }),
        );
      }
    }, 5000);
  }

  async disconnect(): Promise<void> {
    this.live = false;
    if (this.interval) clearInterval(this.interval);
    this.callbacks = null;
  }

  async sendChat(message: string): Promise<void> {
    console.log(`[mock] Chat: ${message}`);
  }

  async getViewerCount(): Promise<number> {
    return Math.floor(Math.random() * 100);
  }

  isLive(): boolean {
    return this.live;
  }
}
