import type { MoltEvent } from '@moltstream/core';

export interface StateDefinition {
  id: string;
  transitions: {
    event: string;
    target: string;
    guard?: (event: MoltEvent) => boolean;
  }[];
}

export interface StateTransition {
  from: string;
  to: string;
  target: string;
  event: string;
  timestamp: string;
}

/**
 * Deterministic state machine for stream orchestration.
 * Given the same sequence of events, always produces the same state.
 */
export class StateMachine {
  private states: Map<string, StateDefinition> = new Map();
  private currentState: string;
  private history: StateTransition[] = [];

  constructor(states: StateDefinition[]) {
    if (states.length === 0) throw new Error('At least one state required');
    for (const s of states) {
      this.states.set(s.id, s);
    }
    this.currentState = states[0].id;
  }

  current(): string {
    return this.currentState;
  }

  process(event: MoltEvent): StateTransition | null {
    const state = this.states.get(this.currentState);
    if (!state) return null;

    for (const t of state.transitions) {
      if (t.event === event.type || t.event === '*') {
        if (t.guard && !t.guard(event)) continue;

        const transition: StateTransition = {
          from: this.currentState,
          to: t.target,
          target: t.target,
          event: event.type,
          timestamp: new Date().toISOString(),
        };

        this.currentState = t.target;
        this.history.push(transition);
        return transition;
      }
    }

    return null;
  }

  getHistory(): readonly StateTransition[] {
    return Object.freeze([...this.history]);
  }
}
