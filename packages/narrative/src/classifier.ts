import type { NarrativeSignal, SignalSource } from './types';

/**
 * NarrativeClassifier extracts narrative labels from raw text
 * using keyword matching and pattern detection.
 *
 * This is the rule-based fast path. For LLM-powered classification,
 * pipe the text through the core reasoning engine instead.
 */
export class NarrativeClassifier {
  private taxonomies: Map<string, string[]>;

  constructor() {
    this.taxonomies = new Map([
      ['ai-coding-agents', [
        'coding agent', 'code agent', 'ai coder', 'autonomous coding',
        'claude code', 'codex', 'cursor', 'ai ide', 'containerized agent',
        'computer use agent',
      ]],
      ['ai-trading', [
        'trading bot', 'trading agent', 'ai trader', 'smart money',
        'copy trade', 'sniper bot', 'mev', 'dex bot',
      ]],
      ['ai-infra', [
        'agent framework', 'agent runtime', 'llm infra', 'model serving',
        'inference', 'vector db', 'embedding', 'rag',
      ]],
      ['depin', [
        'depin', 'decentralized physical', 'iot blockchain', 'compute network',
        'gpu marketplace', 'wireless', 'sensor network',
      ]],
      ['rwa', [
        'real world asset', 'rwa', 'tokenized', 'treasury',
        'bond token', 'asset backed',
      ]],
      ['meme-meta', [
        'brainrot', 'pepe derivative', 'degen', 'casino',
        'gamble', 'pump fun', 'bonding curve',
      ]],
      ['ai-social', [
        'ai influencer', 'ai agent twitter', 'autonomous social',
        'ai kol', 'ai personality', 'truth terminal',
      ]],
      ['gaming-ai', [
        'ai npc', 'game agent', 'autonomous game', 'ai companion',
        'procedural', 'game ai',
      ]],
    ]);
  }

  /**
   * Classify a text snippet and return matching narratives
   * with confidence scores.
   */
  classify(text: string): Array<{ narrative: string; confidence: number; matches: string[] }> {
    const lower = text.toLowerCase();
    const results: Array<{ narrative: string; confidence: number; matches: string[] }> = [];

    for (const [narrative, keywords] of this.taxonomies) {
      const matches = keywords.filter(kw => lower.includes(kw));
      if (matches.length > 0) {
        const confidence = Math.min(1.0, matches.length * 0.25 + 0.2);
        results.push({ narrative, confidence, matches });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Create a NarrativeSignal from classified text.
   */
  signalFromText(
    text: string,
    source: SignalSource,
    evidence: string[] = [],
    growthRate: number = 1.0,
  ): NarrativeSignal[] {
    const classified = this.classify(text);
    return classified.map((c, i) => ({
      id: `${source}-${Date.now()}-${i}`,
      narrative: c.narrative,
      source,
      confidence: c.confidence,
      mentions: c.matches.length,
      growthRate,
      detectedAt: new Date(),
      evidence,
    }));
  }

  /**
   * Register a custom narrative taxonomy.
   */
  addNarrative(name: string, keywords: string[]): void {
    this.taxonomies.set(name, keywords);
  }
}
