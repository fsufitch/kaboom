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
- **Engine design:** see `ARCHITECTURE.md`

## Status

This repository currently contains:

- protobuf schemas for snapshots/turns/moves/effects
- TypeScript code generation tooling (`ts-proto`)
- a minimal scaffold for future engine code

Rules evaluation, effect resolution, and move generation are planned but not implemented yet.

## License

GPL-3.0-only (GNU General Public License v3.0).
