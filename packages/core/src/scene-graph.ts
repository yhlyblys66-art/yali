export interface SceneNode {
  id: string;
  type: 'video' | 'overlay' | 'audio' | 'tts' | 'composite';
  layers: LayerConfig[];
  metadata?: Record<string, any>;
}

export interface LayerConfig {
  source: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  opacity?: number;
  zIndex?: number;
}

export interface SceneTransition {
  from: string;
  to: string;
  type: 'cut' | 'fade' | 'slide' | 'morph';
  duration_ms: number;
}

/**
 * Deterministic Scene Graph — every frame is a pure function of state.
 * No imperative "switch scene" — declare what should be rendered,
 * the runtime figures out transitions.
 */
export class SceneGraph {
  private scenes: Map<string, SceneNode> = new Map();
  private currentSceneId: string | null = null;
  private transitionHistory: SceneTransition[] = [];

  register(scene: SceneNode): void {
    this.scenes.set(scene.id, scene);
    if (!this.currentSceneId) {
      this.currentSceneId = scene.id;
    }
  }

  current(): string {
    return this.currentSceneId ?? 'none';
  }

  getScene(id: string): SceneNode | undefined {
    return this.scenes.get(id);
  }

  /**
   * Transition to a new scene. Returns the computed transition.
   * Deterministic: same inputs always produce same output.
   */
  transition(
    targetId: string,
    type: SceneTransition['type'] = 'cut',
    duration_ms = 300,
  ): SceneTransition {
    const from = this.currentSceneId ?? 'none';

    if (!this.scenes.has(targetId)) {
      throw new Error(`Scene "${targetId}" not registered`);
    }

    const t: SceneTransition = { from, to: targetId, type, duration_ms };
    this.transitionHistory.push(t);
    this.currentSceneId = targetId;
    return t;
  }

  /**
   * Compute the scene that should be active given a set of inputs.
   * Override this for custom scene selection logic.
   */
  compute(inputs: Record<string, any>): SceneNode | null {
    // Default: return current scene
    return this.currentSceneId ? this.scenes.get(this.currentSceneId) ?? null : null;
  }

  history(): readonly SceneTransition[] {
    return Object.freeze([...this.transitionHistory]);
  }

  listScenes(): string[] {
    return Array.from(this.scenes.keys());
  }
}
