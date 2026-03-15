import type { MoltEvent, Session } from '@moltstream/core';

export interface AdapterCallbacks {
  onEvent: (event: MoltEvent) => void;
  session: Session;
}

export interface PlatformAdapter {
  readonly platform: string;
  connect(callbacks: AdapterCallbacks): Promise<void>;
  disconnect(): Promise<void>;
  sendChat(message: string): Promise<void>;
  getViewerCount(): Promise<number>;
  isLive(): boolean;
}
