export interface StreamAction {
  id: string;
  type: 'scene_transition' | 'chat_send' | 'audio_change' | 'overlay_update' | 'tts';
  priority: number;
  payload: Record<string, any>;
  timestamp: string;
  rollbackable: boolean;
}

/**
 * Action Bridge — translates agent decisions into stream actions.
 * Serialization, priority queuing, rollback support.
 */
export class ActionBridge {
  private queue: StreamAction[] = [];
  private history: StreamAction[] = [];
  private maxHistory: number;

  constructor(maxHistory = 100) {
    this.maxHistory = maxHistory;
  }

  submit(action: Omit<StreamAction, 'id' | 'timestamp'>): StreamAction {
    const full: StreamAction = {
      ...action,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(full);
    this.queue.sort((a, b) => b.priority - a.priority);
    return full;
  }

  next(): StreamAction | null {
    const action = this.queue.shift() ?? null;
    if (action) {
      this.history.push(action);
      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(-this.maxHistory);
      }
    }
    return action;
  }

  rollback(): StreamAction | null {
    const last = this.history.pop();
    if (last && last.rollbackable) {
      return last;
    }
    return null;
  }

  pending(): number {
    return this.queue.length;
  }

  getHistory(): readonly StreamAction[] {
    return Object.freeze([...this.history]);
  }
}
