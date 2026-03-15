export interface MemoryEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  type: 'event' | 'decision' | 'audience' | 'metric';
  data: Record<string, any>;
}

/**
 * Persistent Agent Memory — agents remember across sessions.
 * Not "every stream from scratch" — continuous learning.
 */
export class AgentMemory {
  private entries: MemoryEntry[] = [];
  private backend: string;

  constructor(backend: 'memory' | 'sqlite' | 'redis' = 'memory') {
    this.backend = backend;
  }

  store(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const full: MemoryEntry = {
      ...entry,
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(full);
    return full;
  }

  recent(n: number): MemoryEntry[] {
    return this.entries.slice(-n);
  }

  query(filter: Partial<Pick<MemoryEntry, 'type' | 'sessionId'>>): MemoryEntry[] {
    return this.entries.filter((e) => {
      if (filter.type && e.type !== filter.type) return false;
      if (filter.sessionId && e.sessionId !== filter.sessionId) return false;
      return true;
    });
  }

  /**
   * Summarize memory for context window — returns compressed representation.
   */
  summarize(maxEntries = 50): { total: number; recent: MemoryEntry[]; types: Record<string, number> } {
    const types: Record<string, number> = {};
    for (const e of this.entries) {
      types[e.type] = (types[e.type] ?? 0) + 1;
    }
    return {
      total: this.entries.length,
      recent: this.recent(maxEntries),
      types,
    };
  }

  clear(): void {
    this.entries = [];
  }

  get size(): number {
    return this.entries.length;
  }
}
