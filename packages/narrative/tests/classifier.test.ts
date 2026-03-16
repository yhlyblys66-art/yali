import { describe, it, expect } from 'vitest';
import { NarrativeClassifier } from '../src/classifier';

describe('NarrativeClassifier', () => {
  const classifier = new NarrativeClassifier();

  it('classifies AI coding agent narrative', () => {
    const results = classifier.classify('New coding agent launched, containerized agent with AI coder capabilities');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].narrative).toBe('ai-coding-agents');
    expect(results[0].confidence).toBeGreaterThan(0.5);
  });

  it('classifies trading narrative', () => {
    const results = classifier.classify('Launched a new sniper bot for DEX trading with copy trade features');
    expect(results.some(r => r.narrative === 'ai-trading')).toBe(true);
  });

  it('classifies meme meta', () => {
    const results = classifier.classify('Pure brainrot degen play on pump fun');
    expect(results.some(r => r.narrative === 'meme-meta')).toBe(true);
  });

  it('returns empty for unrelated text', () => {
    const results = classifier.classify('The weather is nice today');
    expect(results.length).toBe(0);
  });

  it('generates signals from text', () => {
    const signals = classifier.signalFromText(
      'AI agent framework for autonomous coding',
      'github-trending',
      ['https://github.com/example/repo'],
      2.5,
    );
    expect(signals.length).toBeGreaterThan(0);
    expect(signals[0].source).toBe('github-trending');
    expect(signals[0].growthRate).toBe(2.5);
  });

  it('supports custom narratives', () => {
    classifier.addNarrative('solana-restaking', ['restaking', 'solayer', 'jito restake']);
    const results = classifier.classify('Solayer restaking protocol going live');
    expect(results.some(r => r.narrative === 'solana-restaking')).toBe(true);
  });
});
