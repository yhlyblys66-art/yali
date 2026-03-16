/**
 * Sources for narrative signal detection.
 * Each source contributes weighted signals that are aggregated
 * into a composite narrative score.
 */
export type SignalSource =
  | 'github-trending'
  | 'twitter-ct'
  | 'telegram-alpha'
  | 'onchain-deploy'
  | 'dexscreener-boost'
  | 'reddit-crypto';

export interface NarrativeSignal {
  /** Unique signal identifier */
  id: string;
  /** Detected narrative label (e.g. "ai-coding-agents", "depin", "rwa") */
  narrative: string;
  /** Signal source */
  source: SignalSource;
  /** Confidence score 0-1 */
  confidence: number;
  /** Raw mention/activity count */
  mentions: number;
  /** Growth rate vs previous window (e.g. 3.4 = 340% increase) */
  growthRate: number;
  /** Timestamp of detection */
  detectedAt: Date;
  /** Supporting evidence URLs */
  evidence: string[];
}

export interface NarrativeScore {
  /** Narrative label */
  narrative: string;
  /** Composite score 0-100 */
  score: number;
  /** Lifecycle phase */
  phase: 'emerging' | 'accelerating' | 'peaking' | 'declining';
  /** Contributing signals */
  signals: NarrativeSignal[];
  /** Time since first detection */
  ageHours: number;
  /** Estimated time to peak (hours) */
  estimatedPeakIn: number | null;
  /** Related token addresses if any */
  relatedTokens: string[];
}

export interface NarrativeConfig {
  /** Minimum confidence to emit a signal */
  minConfidence: number;
  /** Aggregation window in minutes */
  windowMinutes: number;
  /** Source weights for composite scoring */
  sourceWeights: Partial<Record<SignalSource, number>>;
  /** Minimum growth rate to classify as "emerging" */
  emergingThreshold: number;
  /** How often to poll sources (seconds) */
  pollIntervalSec: number;
}

export const DEFAULT_CONFIG: NarrativeConfig = {
  minConfidence: 0.3,
  windowMinutes: 60,
  sourceWeights: {
    'github-trending': 1.5,
    'twitter-ct': 1.2,
    'telegram-alpha': 1.0,
    'onchain-deploy': 1.8,
    'dexscreener-boost': 0.8,
    'reddit-crypto': 0.6,
  },
  emergingThreshold: 2.0,
  pollIntervalSec: 30,
};
