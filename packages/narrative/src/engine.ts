import { SignalAggregator } from './aggregator';
import { NarrativeClassifier } from './classifier';
import type { NarrativeConfig, NarrativeScore, NarrativeSignal } from './types';
import { EventEmitter } from 'events';

interface NarrativeEvents {
  'narrative:emerging': (score: NarrativeScore) => void;
  'narrative:accelerating': (score: NarrativeScore) => void;
  'narrative:peaking': (score: NarrativeScore) => void;
  'signal:ingested': (signal: NarrativeSignal) => void;
}

/**
 * NarrativeEngine orchestrates signal collection, classification,
 * aggregation, and emits events when narratives change phase.
 *
 * Usage:
 *   const engine = new NarrativeEngine();
 *   engine.on('narrative:emerging', (n) => console.log('NEW META:', n.narrative));
 *   engine.ingestText('New AI coding agent just launched on GitHub', 'github-trending');
 *   const top = engine.topNarratives(5);
 */
export class NarrativeEngine extends EventEmitter {
  private aggregator: SignalAggregator;
  private classifier: NarrativeClassifier;
  private previousPhases: Map<string, string> = new Map();

  constructor(config: Partial<NarrativeConfig> = {}) {
    super();
    this.aggregator = new SignalAggregator(config);
    this.classifier = new NarrativeClassifier();
  }

  /**
   * Ingest raw text — classify and aggregate automatically.
   */
  ingestText(
    text: string,
    source: NarrativeSignal['source'],
    evidence: string[] = [],
    growthRate: number = 1.0,
  ): NarrativeSignal[] {
    const signals = this.classifier.signalFromText(text, source, evidence, growthRate);

    for (const signal of signals) {
      const accepted = this.aggregator.ingest(signal);
      if (accepted) {
        this.emit('signal:ingested', signal);
      }
    }

    // Check for phase transitions
    this.checkPhaseTransitions();

    return signals;
  }

  /**
   * Directly ingest a pre-built signal.
   */
  ingestSignal(signal: NarrativeSignal): boolean {
    const accepted = this.aggregator.ingest(signal);
    if (accepted) {
      this.emit('signal:ingested', signal);
      this.checkPhaseTransitions();
    }
    return accepted;
  }

  /**
   * Get top narratives by composite score.
   */
  topNarratives(n: number = 10): NarrativeScore[] {
    return this.aggregator.top(n);
  }

  /**
   * Check if a narrative is currently active.
   */
  isNarrativeActive(narrative: string): boolean {
    return this.aggregator.isActive(narrative);
  }

  /**
   * Get the classifier for custom taxonomy registration.
   */
  getClassifier(): NarrativeClassifier {
    return this.classifier;
  }

  private checkPhaseTransitions(): void {
    const scores = this.aggregator.score();
    for (const score of scores) {
      const prevPhase = this.previousPhases.get(score.narrative);
      if (prevPhase !== score.phase) {
        this.previousPhases.set(score.narrative, score.phase);
        if (prevPhase) {
          // Phase changed — emit event
          if (score.phase === 'emerging') {
            this.emit('narrative:emerging', score);
          } else if (score.phase === 'accelerating') {
            this.emit('narrative:accelerating', score);
          } else if (score.phase === 'peaking') {
            this.emit('narrative:peaking', score);
          }
        }
      }
    }
  }
}
