/**
 * VectorMemory — persistent agent memory with semantic vector search.
 *
 * Agents don't just remember — they understand context.
 * Entries are embedded and indexed for cosine-similarity retrieval,
 * enabling agents to recall relevant memories without exact keyword matching.
 *
 * Backends: in-memory (dev), SQLite+embeddings (local), Qdrant (production).
 */

export interface VectorEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  type: 'event' | 'decision' | 'audience' | 'metric' | 'reflection';
  content: string;
  embedding?: Float32Array;
  metadata: Record<string, any>;
  ttl?: number; // seconds, 0 = forever
}

export interface SearchResult {
  entry: VectorEntry;
  score: number; // cosine similarity 0..1
  distance: number;
}

export interface EmbeddingProvider {
  /** Produce a vector embedding for the given text */
  embed(text: string): Promise<Float32Array>;
  /** Batch embed for efficiency */
  embedBatch(texts: string[]): Promise<Float32Array[]>;
  /** Embedding dimension */
  readonly dimensions: number;
}

export interface VectorBackend {
  readonly name: string;
  insert(entry: VectorEntry): Promise<void>;
  search(embedding: Float32Array, topK: number, filter?: SearchFilter): Promise<SearchResult[]>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  flush(): Promise<void>;
}

export interface SearchFilter {
  type?: VectorEntry['type'];
  sessionId?: string;
  after?: string; // ISO timestamp
  before?: string;
  minScore?: number;
}

/**
 * In-memory vector backend — brute-force cosine similarity.
 * Fast for <10K entries, no dependencies.
 */
export class InMemoryVectorBackend implements VectorBackend {
  readonly name = 'memory';
  private store: VectorEntry[] = [];

  async insert(entry: VectorEntry): Promise<void> {
    this.store.push(entry);
  }

  async search(
    embedding: Float32Array,
    topK: number,
    filter?: SearchFilter,
  ): Promise<SearchResult[]> {
    let candidates = this.store.filter((e) => e.embedding != null);

    if (filter?.type) candidates = candidates.filter((e) => e.type === filter.type);
    if (filter?.sessionId)
      candidates = candidates.filter((e) => e.sessionId === filter.sessionId);
    if (filter?.after) candidates = candidates.filter((e) => e.timestamp >= filter.after!);
    if (filter?.before) candidates = candidates.filter((e) => e.timestamp < filter.before!);

    const scored: SearchResult[] = candidates.map((entry) => {
      const score = cosineSimilarity(embedding, entry.embedding!);
      return { entry, score, distance: 1 - score };
    });

    scored.sort((a, b) => b.score - a.score);

    const minScore = filter?.minScore ?? 0;
    return scored.filter((r) => r.score >= minScore).slice(0, topK);
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.store.splice(idx, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.store.length;
  }

  async flush(): Promise<void> {
    this.store = [];
  }
}

/**
 * Cosine similarity between two vectors.
 * Returns value between -1 and 1 (normalized to 0..1 for unsigned embeddings).
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) throw new Error(`Dimension mismatch: ${a.length} vs ${b.length}`);

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Local embedding provider using a lightweight model.
 * Falls back to TF-IDF hashing when no model is available.
 */
export class HashEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions: number;

  constructor(dimensions = 256) {
    this.dimensions = dimensions;
  }

  async embed(text: string): Promise<Float32Array> {
    return hashEmbed(text, this.dimensions);
  }

  async embedBatch(texts: string[]): Promise<Float32Array[]> {
    return texts.map((t) => hashEmbed(t, this.dimensions));
  }
}

/**
 * Simple hash-based embedding (feature hashing / hashing trick).
 * Not as good as a real model but zero dependencies.
 */
function hashEmbed(text: string, dims: number): Float32Array {
  const vec = new Float32Array(dims);
  const tokens = text.toLowerCase().split(/\s+/);

  for (const token of tokens) {
    let h = 0;
    for (let i = 0; i < token.length; i++) {
      h = (Math.imul(31, h) + token.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(h) % dims;
    const sign = h >= 0 ? 1 : -1;
    vec[idx] += sign;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dims; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dims; i++) vec[i] /= norm;
  }

  return vec;
}

/**
 * VectorMemory — the main interface agents use.
 * Wraps backend + embedding provider into a clean API.
 */
export class VectorMemory {
  private backend: VectorBackend;
  private embedder: EmbeddingProvider;

  constructor(backend?: VectorBackend, embedder?: EmbeddingProvider) {
    this.backend = backend ?? new InMemoryVectorBackend();
    this.embedder = embedder ?? new HashEmbeddingProvider();
  }

  /**
   * Store a memory entry with automatic embedding.
   */
  async store(entry: Omit<VectorEntry, 'id' | 'timestamp' | 'embedding'>): Promise<VectorEntry> {
    const embedding = await this.embedder.embed(entry.content);
    const full: VectorEntry = {
      ...entry,
      id: `vmem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      embedding,
    };
    await this.backend.insert(full);
    return full;
  }

  /**
   * Semantic search: find memories similar to a query string.
   */
  async search(query: string, topK = 5, filter?: SearchFilter): Promise<SearchResult[]> {
    const embedding = await this.embedder.embed(query);
    return this.backend.search(embedding, topK, filter);
  }

  /**
   * Recall memories relevant to the current reasoning context.
   * Used by ReasoningEngine to inject relevant past experience.
   */
  async recall(context: string, maxTokenBudget = 2000): Promise<string> {
    const results = await this.search(context, 10, { minScore: 0.3 });
    let output = '';
    let budget = maxTokenBudget;

    for (const r of results) {
      const line = `[${r.entry.type}] ${r.entry.content} (score: ${r.score.toFixed(2)})\n`;
      if (line.length > budget) break;
      output += line;
      budget -= line.length;
    }

    return output;
  }

  async forget(id: string): Promise<boolean> {
    return this.backend.delete(id);
  }

  async size(): Promise<number> {
    return this.backend.count();
  }

  async clear(): Promise<void> {
    return this.backend.flush();
  }
}
