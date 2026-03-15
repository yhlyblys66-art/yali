import type { PlatformAdapter, AdapterCallbacks } from './types.js';

export interface YouTubeConfig {
  streamKey: string;
  apiKey?: string;
}

export class YouTubeAdapter implements PlatformAdapter {
  readonly platform = 'youtube';
  private config: YouTubeConfig;
  private callbacks: AdapterCallbacks | null = null;
  private live = false;

  constructor(config: YouTubeConfig) {
    this.config = config;
  }

  async connect(callbacks: AdapterCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.live = true;
  }

  async disconnect(): Promise<void> {
    this.live = false;
    this.callbacks = null;
  }

  async sendChat(message: string): Promise<void> {
    if (!this.live) throw new Error('Not connected');
  }

  async getViewerCount(): Promise<number> {
    return 0;
  }

  isLive(): boolean {
    return this.live;
  }
}
