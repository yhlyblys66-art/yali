# Contributing to MoltStream

Contributions welcome. Here's how to get started.

## Setup

```bash
git clone https://github.com/skaggsxyz/moltstream.git
cd moltstream
npm install
npm run build
```

## Development

```bash
# Run all packages in dev mode
npm run dev

# Run tests
npm run test

# Lint
npm run lint
```

## Architecture

MoltStream is a monorepo managed with Turborepo. Each package in `packages/` is an independent module:

- **core** — Agent runtime, session management, scene graph, event bus
- **orchestrator** — State machine, event queue, deterministic execution
- **adapters** — Platform adapters (Twitch, YouTube, Kick, Mock)
- **bridge** — Action serialization, priority queuing, rollback
- **policy** — Content filtering, rate limits, emergency stop
- **audit** — Reasoning traces, decision logs, metrics
- **cli** — Command-line tooling

## Pull Requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Write tests for new functionality
4. Ensure `npm run test` passes
5. Submit a PR with a clear description

## Code Style

- TypeScript strict mode
- Prettier for formatting
- No `any` types unless absolutely necessary
- Document public APIs with JSDoc comments
