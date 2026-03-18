import { describe, it, expect } from 'vitest';
import { Counter, Gauge, Histogram, MetricsRegistry } from '../src/metrics.js';

describe('Counter', () => {
  it('should increment and retrieve values', () => {
    const counter = new Counter('requests_total', 'Total requests');
    counter.inc({ method: 'GET' });
    counter.inc({ method: 'GET' });
    counter.inc({ method: 'POST' });
    expect(counter.get({ method: 'GET' })).toBe(2);
    expect(counter.get({ method: 'POST' })).toBe(1);
  });

  it('should collect all values', () => {
    const counter = new Counter('test', 'test');
    counter.inc({ a: '1' }, 5);
    const collected = counter.collect();
    expect(collected).toHaveLength(1);
    expect(collected[0].value).toBe(5);
  });

  it('should reset', () => {
    const counter = new Counter('test', 'test');
    counter.inc({}, 10);
    counter.reset();
    expect(counter.get({})).toBe(0);
  });
});

describe('Gauge', () => {
  it('should set, inc, and dec', () => {
    const gauge = new Gauge('connections', 'Active connections');
    gauge.set(5);
    expect(gauge.get()).toBe(5);
    gauge.inc({}, 3);
    expect(gauge.get()).toBe(8);
    gauge.dec({}, 2);
    expect(gauge.get()).toBe(6);
  });
});

describe('Histogram', () => {
  it('should track observations and compute percentiles', () => {
    const hist = new Histogram('latency', 'Request latency');
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach((v) => hist.observe(v));
    expect(hist.count).toBe(10);
    expect(hist.sum).toBe(550);
    expect(hist.mean).toBe(55);
    expect(hist.percentile(50)).toBe(50);
    expect(hist.percentile(95)).toBe(100);
  });

  it('should compute buckets', () => {
    const hist = new Histogram('test', 'test', [10, 50, 100]);
    [5, 15, 55, 99].forEach((v) => hist.observe(v));
    const buckets = hist.buckets();
    expect(buckets).toEqual([
      { le: 10, count: 1 },
      { le: 50, count: 2 },
      { le: 100, count: 4 },
    ]);
  });
});

describe('MetricsRegistry', () => {
  it('should create and retrieve metrics', () => {
    const registry = new MetricsRegistry();
    const counter = registry.counter('req', 'requests');
    counter.inc({}, 3);
    const gauge = registry.gauge('conn', 'connections');
    gauge.set(42);
    const json = registry.toJSON();
    expect(json).toHaveProperty('req');
    expect(json).toHaveProperty('conn');
  });
});
