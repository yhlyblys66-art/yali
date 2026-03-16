import type { NarrativeSignal, NarrativeScore, NarrativeConfig, SignalSource } from './types';
import { DEFAULT_CONFIG } from './types';

/**
 * SignalAggregator collects raw signals from multiple sources
 * and produces composite narrative scores with lifecycle tracking.
 *
 * Signals within the same aggregation window are grouped by narrative,
 * weighted by source, and scored using exponential decay for recency.
 */
export class SignalAggregator {
  private signals: NarrativeSignal[] = [];
  private config: NarrativeConfig;

  constructor(config: Partial<NarrativeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Ingest a raw signal from any source.
   * Signals below the confidence threshold are discarded.
   */
  ingest(signal: NarrativeSignal): boolean {
    if (signal.confidence < this.config.minConfidence) {
      return false;
    }
    this.signals.push(signal);
    this.pruneExpired();
    return true;
  }

  /**
   * Compute composite scores for all active narratives.
   * Returns sorted by score descending.
   */
  score(): NarrativeScore[] {
    this.pruneExpired();
    const grouped = this.groupByNarrative();
    const scores: NarrativeScore[] = [];

    for (const [narrative, signals] of grouped.entries()) {
      const weightedSum = signals.reduce((acc, s) => {
        const sourceWeight = this.config.sourceWeights[s.source] ?? 1.0;
        const recency = this.recencyFactor(s.detectedAt);
        return acc + s.confidence * sourceWeight * recency * s.growthRate;
      }, 0);

      // Normalize to 0-100 scale
      const maxPossible = signals.length * 3.0; // theoretical max per signal
      const score = Math.min(100, Math.round((weightedSum / Math.max(maxPossible, 1)) * 100));

      const firstSeen = Math.min(...signals.map(s => s.detectedAt.getTime()));
      const ageHours = (Date.now() - firstSeen) / (1000 * 60 * 60);
      const avgGrowth = signals.reduce((a, s) => a + s.growthRate, 0) / signals.length;

      scores.push({
        narrative,
        score,
        phase: this.classifyPhase(avgGrowth, ageHours),
        signals,
        ageHours: Math.round(ageHours * 10) / 10,
        estimatedPeakIn: this.estimatePeak(avgGrowth, ageHours),
        relatedTokens: this.extractTokens(signals),
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get top N narratives by score.
   */
  top(n: number): NarrativeScore[] {
    return this.score().slice(0, n);
  }

  /**
   * Check if a specific narrative is currently active.
   */
  isActive(narrative: string): boolean {
    return this.score().some(s => s.narrative === narrative && s.score > 20);
  }

  private groupByNarrative(): Map<string, NarrativeSignal[]> {
    const map = new Map<string, NarrativeSignal[]>();
    for (const signal of this.signals) {
      const key = signal.narrative.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(signal);
    }
    return map;
  }

  private recencyFactor(detectedAt: Date): number {
    const ageMinutes = (Date.now() - detectedAt.getTime()) / (1000 * 60);
    // Exponential decay: half-life = window size
    return Math.exp(-0.693 * (ageMinutes / this.config.windowMinutes));
  }

  private classifyPhase(avgGrowth: number, ageHours: number): NarrativeScore['phase'] {
    if (ageHours < 2 && avgGrowth > this.config.emergingThreshold) return 'emerging';
    if (avgGrowth > 1.5) return 'accelerating';
    if (avgGrowth > 0.8) return 'peaking';
    return 'declining';
  }

  private estimatePeak(avgGrowth: number, ageHours: number): number | null {
    if (avgGrowth <= 1.0) return null; // already declining
    // Rough heuristic: narratives peak at ~2-3x their current age
    return Math.round((ageHours * 2.5 - ageHours) * 10) / 10;
  }

  private extractTokens(signals: NarrativeSignal[]): string[] {
    const tokens = new Set<string>();
    for (const s of signals) {
      for (const url of s.evidence) {
        // Extract Solana addresses from evidence URLs
        const match = url.match(/([1-9A-HJ-NP-Za-km-z]{32,44})/);
        if (match) tokens.add(match[1]);
      }
    }
    return [...tokens];
  }

  private pruneExpired(): void {
    const cutoff = Date.now() - this.config.windowMinutes * 60 * 1000 * 6; // keep 6 windows
    this.signals = this.signals.filter(s => s.detectedAt.getTime() > cutoff);
  }
}
