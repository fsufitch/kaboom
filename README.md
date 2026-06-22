# Kaboom Chess Engine (TypeScript)

A headless, stateless rules engine for **Classic Chess** and **Kaboom Chess**.

This project is intentionally _not_ a game client. It is meant to be embedded in:

- a stateful multiplayer server (WebSockets, gRPC, REST, etc.)
- a CLI workflow (snapshot files / play-by-email)
- a hotseat app (native or web)
- AI tooling (move generation, simulation)

The core design is functional: immutable `GameSnapshot` in, validated/resolved turns and new snapshots out.

## What is Kaboom Chess?

Kaboom Chess is a family of chess variants with:

- **no check/checkmate**
- **no castling / no en passant**
- **bumps and chain bumps** instead of normal captures
- explosive/special piece abilities
- (in some variants) **bench deployment** of captured pieces

## Docs

- **Player rules:** see `KABOOM.md`
- **Engine design:** see `ARCHITECTURE.md` (WIP)

## Repo structure

This is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces).

- `packages/engine`: core rules engine (Classic + Kaboom rulesets)
- `packages/proto`: protobuf schemas + generated TypeScript
- `packages/cli`: headless CLI wrapper for running the engine
- `ARCHITECTURE.md`: internal design notes and data flow
- `KABOOM.md`: player-facing rules for the Kaboom variant
- `TESTING.md`: test strategy and commands

## Development

### Install

- `pnpm install` - install dependencies for all packages

### Builds

- Build everything: `pnpm -r build`
- Build a single package: `pnpm -C packages/engine build`
  - Or: in the package directory, run `pnpm build`

### Linting

- Lint all workspaces: `pnpm -r lint`
  - Or lint a single package: `pnpm -C packages/engine lint`
  - Or: in the package directory, run `pnpm lint`
- Fix lint issues: `pnpm lint:fix`
  - Or fix a single package: `pnpm -C packages/engine lint:fix`
  - Or: in the package directory, run `pnpm lint:fix`
- Format code: `pnpm format`

### Testing

See [TESTING.md](TESTING.md) for details on the testing strategy, setup, and commands.

## License

GPL-3.0-only (GNU General Public License v3.0).
