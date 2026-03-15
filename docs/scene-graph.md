# Scene Graph

The scene graph is the core abstraction for what appears on stream. Instead of imperatively switching scenes (like clicking buttons in OBS), agents declare a computed scene state.

## Concepts

### Scene Nodes

A scene node represents a renderable unit:

```typescript
interface SceneNode {
  id: string;
  type: 'video' | 'overlay' | 'audio' | 'tts' | 'composite';
  layers: LayerConfig[];
  metadata?: Record<string, any>;
}
```

### Declarative Composition

Scenes are composed from layers. Each layer has a source, position, size, and opacity:

```typescript
const mainScene: SceneNode = {
  id: 'main',
  type: 'composite',
  layers: [
    { source: 'camera://0', position: { x: 0, y: 0 }, size: { width: 1920, height: 1080 }, zIndex: 0 },
    { source: 'overlay://chat', position: { x: 1500, y: 50 }, size: { width: 400, height: 600 }, zIndex: 10 },
    { source: 'audio://bgm', zIndex: -1 },
  ],
};
```

### Deterministic Transitions

Transitions between scenes are deterministic — same inputs, same output:

```typescript
// Transition types: cut, fade, slide, morph
sceneGraph.transition('chill-scene', 'fade', 500);
```

The scene graph records all transitions for debugging and replay.

## Usage

```typescript
import { SceneGraph } from '@moltstream/core';

const sg = new SceneGraph();

sg.register({ id: 'intro', type: 'composite', layers: [...] });
sg.register({ id: 'main', type: 'composite', layers: [...] });
sg.register({ id: 'outro', type: 'composite', layers: [...] });

// Current scene
console.log(sg.current()); // 'intro'

// Transition
sg.transition('main', 'fade', 300);

// History
console.log(sg.history());
// [{ from: 'intro', to: 'main', type: 'fade', duration_ms: 300 }]
```

## Computed Scenes

Override the `compute` method for dynamic scene selection:

```typescript
class SmartSceneGraph extends SceneGraph {
  compute(inputs: Record<string, any>): SceneNode | null {
    const { viewerCount, chatRate, timeOfDay } = inputs;
    
    if (chatRate > 100) return this.getScene('hype');
    if (viewerCount < 10) return this.getScene('chill');
    if (timeOfDay === 'night') return this.getScene('ambient');
    
    return this.getScene('main');
  }
}
```

This makes scene selection a pure function — testable, reproducible, debuggable.
