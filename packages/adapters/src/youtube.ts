/**
 * YouTube Live Adapter
 *
 * Connects MoltStream agents to YouTube Live Chat via the Data API v3.
 * Polls chat messages, maps them to audience signals, and handles
 * super chats, memberships, and moderation events.
 */

import type { MoltEvent } from '@moltstream/core';

export interface YouTubeAdapterConfig {
  /** YouTube Data API v3 key */
  apiKey: string;
  /** Live broadcast / video ID */
  videoId: string;
  /** Poll interval in ms (default: 5000, min: 2000 per YT quota) */
  pollIntervalMs?: number;
  /** Filter: minimum message length to forward */
  minMessageLength?: number;
  /** Handle super chats */
  handleSuperChats?: boolean;
}

export interface YouTubeChatMessage {
  id: string;
  authorChannelId: string;
  authorDisplayName: string;
  message: string;
  publishedAt: string;
  isModerator: boolean;
  isMember: boolean;
  superChatAmount?: number;
  superChatCurrency?: string;
}

export interface YouTubeStreamInfo {
  title: string;
  concurrentViewers: number;
  activeLiveChatId: string;
  status: 'live' | 'upcoming' | 'complete' | 'unknown';
}

type ChatMessageHandler = (messages: YouTubeChatMessage[]) => void;

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

export class YouTubeAdapter {
  private liveChatId: string | null = null;
  private nextPageToken: string | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private handlers: ChatMessageHandler[] = [];
  private config: Required<YouTubeAdapterConfig>;
  private isPolling = false;

  constructor(config: YouTubeAdapterConfig) {
    this.config = {
      pollIntervalMs: 5000,
      minMessageLength: 1,
      handleSuperChats: true,
      ...config,
    };
  }

  /**
   * Resolve live chat ID from video ID.
   */
  async resolveChat(): Promise<YouTubeStreamInfo> {
    const url = `${YT_API_BASE}/videos?part=liveStreamingDetails,snippet,statistics&id=${this.config.videoId}&key=${this.config.apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const video = data.items?.[0];

    if (!video) {
      throw new Error(`Video ${this.config.videoId} not found`);
    }

    const chatId = video.liveStreamingDetails?.activeLiveChatId;
    if (!chatId) {
      throw new Error(`No active live chat for video ${this.config.videoId}`);
    }

    this.liveChatId = chatId;

    return {
      title: video.snippet?.title ?? '',
      concurrentViewers: parseInt(
        video.liveStreamingDetails?.concurrentViewers ?? '0',
        10,
      ),
      activeLiveChatId: chatId,
      status: this.resolveStatus(video.snippet?.liveBroadcastContent),
    };
  }

  /**
   * Start polling chat messages.
   */
  async startPolling(): Promise<void> {
    if (!this.liveChatId) {
      await this.resolveChat();
    }

    if (this.pollTimer) return;

    this.isPolling = true;
    this.pollTimer = setInterval(async () => {
      if (!this.isPolling) return;
      try {
        await this.pollMessages();
      } catch (err) {
        console.error('[YouTubeAdapter] poll error:', err);
      }
    }, this.config.pollIntervalMs);
  }

  /**
   * Stop polling.
   */
  stopPolling(): void {
    this.isPolling = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Register a handler for incoming chat messages.
   */
  onMessages(handler: ChatMessageHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Convert a YouTube chat message to a MoltStream event.
   */
  toMoltEvent(msg: YouTubeChatMessage): MoltEvent {
    return {
      type: msg.superChatAmount ? 'superchat' : 'chat',
      source: 'platform',
      data: {
        user: msg.authorDisplayName,
        userId: msg.authorChannelId,
        message: msg.message,
        isModerator: msg.isModerator,
        isMember: msg.isMember,
        ...(msg.superChatAmount && {
          amount: msg.superChatAmount,
          currency: msg.superChatCurrency,
        }),
      },
      timestamp: new Date(msg.publishedAt).toISOString(),
    };
  }

  private async pollMessages(): Promise<void> {
    if (!this.liveChatId) return;

    let url = `${YT_API_BASE}/liveChat/messages?liveChatId=${this.liveChatId}&part=snippet,authorDetails&key=${this.config.apiKey}`;
    if (this.nextPageToken) {
      url += `&pageToken=${this.nextPageToken}`;
    }

    const res = await fetch(url);
    if (!res.ok) return;

    const data = (await res.json()) as any;
    this.nextPageToken = data.nextPageToken ?? null;

    const messages: YouTubeChatMessage[] = (data.items ?? [])
      .map((item: any) => this.parseMessage(item))
      .filter((m: YouTubeChatMessage) => m.message.length >= this.config.minMessageLength);

    if (messages.length > 0) {
      for (const handler of this.handlers) {
        handler(messages);
      }
    }
  }

  private parseMessage(item: any): YouTubeChatMessage {
    const snippet = item.snippet ?? {};
    const author = item.authorDetails ?? {};
    const superChat = snippet.superChatDetails;

    return {
      id: item.id,
      authorChannelId: author.channelId ?? '',
      authorDisplayName: author.displayName ?? 'Unknown',
      message: snippet.displayMessage ?? snippet.textMessageDetails?.messageText ?? '',
      publishedAt: snippet.publishedAt ?? new Date().toISOString(),
      isModerator: author.isChatModerator ?? false,
      isMember: author.isChatSponsor ?? false,
      ...(this.config.handleSuperChats && superChat
        ? {
            superChatAmount: parseFloat(superChat.amountMicros) / 1_000_000,
            superChatCurrency: superChat.currency,
          }
        : {}),
    };
  }

  private resolveStatus(
    content?: string,
  ): YouTubeStreamInfo['status'] {
    switch (content) {
      case 'live':
        return 'live';
      case 'upcoming':
        return 'upcoming';
      case 'none':
        return 'complete';
      default:
        return 'unknown';
    }
  }
}
