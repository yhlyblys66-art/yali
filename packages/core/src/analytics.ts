/**
 * @moltstream/core — Chat Analytics
 *
 * Real-time audience analytics: engagement tracking, sentiment windows,
 * chatter profiles, and session summaries.
 */

export interface ChatterProfile {
  id: string;
  username: string;
  messageCount: number;
  firstSeen: number;
  lastSeen: number;
  avgMessageLength: number;
  /** How many of this user's messages triggered an agent response */
  engagementHits: number;
}

export interface EngagementWindow {
  /** Window start timestamp */
  start: number;
  /** Window end timestamp */
  end: number;
  /** Messages received in this window */
  messageCount: number;
  /** Unique chatters in this window */
  uniqueChatters: number;
  /** Messages per minute */
  messagesPerMinute: number;
  /** Agent responses in this window */
  responsesGenerated: number;
}

export interface SessionSummary {
  /** Session start */
  startedAt: number;
  /** Duration in seconds */
  durationSeconds: number;
  /** Total messages processed */
  totalMessages: number;
  /** Unique chatters seen */
  uniqueChatters: number;
  /** Peak messages per minute */
  peakMessagesPerMinute: number;
  /** Agent response count */
  totalResponses: number;
  /** Top chatters by message count */
  topChatters: ChatterProfile[];
  /** Engagement windows over session */
  engagementTimeline: EngagementWindow[];
}

export interface AnalyticsConfig {
  /** Window size in milliseconds (default: 60_000 = 1 min) */
  windowMs?: number;
  /** Max windows to retain (default: 60 = 1 hour of 1-min windows) */
  maxWindows?: number;
  /** Top N chatters in summary (default: 10) */
  topN?: number;
}

/**
 * ChatAnalytics — tracks real-time engagement and audience patterns.
 */
export class ChatAnalytics {
  private chatters: Map<string, ChatterProfile> = new Map();
  private windows: EngagementWindow[] = [];
  private currentWindow: EngagementWindow | null = null;
  private sessionStart: number;
  private totalMessages = 0;
  private totalResponses = 0;
  private peakMpm = 0;

  private windowMs: number;
  private maxWindows: number;
  private topN: number;
  private windowChatters: Set<string> = new Set();

  constructor(config: AnalyticsConfig = {}) {
    this.windowMs = config.windowMs ?? 60_000;
    this.maxWindows = config.maxWindows ?? 60;
    this.topN = config.topN ?? 10;
    this.sessionStart = Date.now();
  }

  /** Record an incoming chat message */
  recordMessage(senderId: string, username: string, content: string): void {
    const now = Date.now();
    this.totalMessages++;

    // Update chatter profile
    const existing = this.chatters.get(senderId);
    if (existing) {
      const totalLen = existing.avgMessageLength * existing.messageCount + content.length;
      existing.messageCount++;
      existing.lastSeen = now;
      existing.avgMessageLength = totalLen / existing.messageCount;
    } else {
      this.chatters.set(senderId, {
        id: senderId,
        username,
        messageCount: 1,
        firstSeen: now,
        lastSeen: now,
        avgMessageLength: content.length,
        engagementHits: 0,
      });
    }

    // Update engagement window
    this.ensureWindow(now);
    this.currentWindow!.messageCount++;
    this.windowChatters.add(senderId);
    this.currentWindow!.uniqueChatters = this.windowChatters.size;
    this.currentWindow!.messagesPerMinute =
      (this.currentWindow!.messageCount / this.windowMs) * 60_000;

    if (this.currentWindow!.messagesPerMinute > this.peakMpm) {
      this.peakMpm = this.currentWindow!.messagesPerMinute;
    }
  }

  /** Record that an agent response was generated (optionally for a specific chatter) */
  recordResponse(chatterId?: string): void {
    this.totalResponses++;
    if (this.currentWindow) {
      this.currentWindow.responsesGenerated++;
    }
    if (chatterId) {
      const profile = this.chatters.get(chatterId);
      if (profile) profile.engagementHits++;
    }
  }

  /** Get the current engagement snapshot */
  currentEngagement(): EngagementWindow | null {
    return this.currentWindow ? { ...this.currentWindow } : null;
  }

  /** Get a specific chatter's profile */
  getChatter(senderId: string): ChatterProfile | undefined {
    const p = this.chatters.get(senderId);
    return p ? { ...p } : undefined;
  }

  /** Get unique chatter count */
  get uniqueChatterCount(): number {
    return this.chatters.size;
  }

  /** Generate a full session summary */
  summary(): SessionSummary {
    const now = Date.now();
    this.closeWindow(now);

    const topChatters = [...this.chatters.values()]
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, this.topN)
      .map((c) => ({ ...c }));

    return {
      startedAt: this.sessionStart,
      durationSeconds: Math.floor((now - this.sessionStart) / 1000),
      totalMessages: this.totalMessages,
      uniqueChatters: this.chatters.size,
      peakMessagesPerMinute: Math.round(this.peakMpm * 100) / 100,
      totalResponses: this.totalResponses,
      topChatters,
      engagementTimeline: this.windows.map((w) => ({ ...w })),
    };
  }

  /** Reset all analytics data */
  reset(): void {
    this.chatters.clear();
    this.windows = [];
    this.currentWindow = null;
    this.windowChatters.clear();
    this.totalMessages = 0;
    this.totalResponses = 0;
    this.peakMpm = 0;
    this.sessionStart = Date.now();
  }

  private ensureWindow(now: number): void {
    if (!this.currentWindow || now >= this.currentWindow.end) {
      this.closeWindow(now);
      const start = now;
      this.currentWindow = {
        start,
        end: start + this.windowMs,
        messageCount: 0,
        uniqueChatters: 0,
        messagesPerMinute: 0,
        responsesGenerated: 0,
      };
      this.windowChatters.clear();
    }
  }

  private closeWindow(now: number): void {
    if (this.currentWindow && this.currentWindow.messageCount > 0) {
      this.currentWindow.end = Math.min(this.currentWindow.end, now);
      this.windows.push({ ...this.currentWindow });
      if (this.windows.length > this.maxWindows) {
        this.windows.shift();
      }
    }
  }
}
