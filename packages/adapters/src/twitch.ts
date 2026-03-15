import type { PlatformAdapter, AdapterCallbacks } from './types.js';

export interface TwitchConfig {
  streamKey: string;
  clientId?: string;
  clientSecret?: string;
  channel?: string;
}

export class TwitchAdapter implements PlatformAdapter {
  readonly platform = 'twitch';
  private config: TwitchConfig;
  private callbacks: AdapterCallbacks | null = null;
  private live = false;

  constructor(config: TwitchConfig) {
    this.config = config;
  }

  async connect(callbacks: AdapterCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.live = true;
    // IRC + EventSub connection logic
  }

  async disconnect(): Promise<void> {
    this.live = false;
    this.callbacks = null;
  }

  async sendChat(message: string): Promise<void> {
    if (!this.live) throw new Error('Not connected');
    // TMI.js chat send
  }

  async getViewerCount(): Promise<number> {
    // Helix API poll
    return 0;
  }

  isLive(): boolean {
    return this.live;
  }
}
