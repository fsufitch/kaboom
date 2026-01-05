# Kaboom Engine Architecture

Kaboom is a **headless**, **stateless**, **functional** rules engine for Classic Chess and Kaboom Chess.

- **Headless:** it has no UI, no networking, and no persistent “session.”
- **Stateless:** it does not hold a “current game.” Every operation is driven entirely by the data you pass in.
- **Functional:** the core is a set of pure transformers that turn one immutable snapshot into the next.

This document describes how the engine is intended to be used and how the internal pipeline is structured. The player-facing rules live in `KABOOM.md`.

---

## Goals

### What the engine is for

Kaboom exists to answer questions like:

- “Is this player’s turn legal?”
- “If I apply this turn, what happens to the game state?”
- “What are all legal turns from this position?”

…and to do so in a way that is:

- **Deterministic:** same input → same output.
- **Auditable:** every state transition can be explained by recorded effects.
- **Serializable:** game state is portable across languages and processes.
- **Composable:** easy to embed in servers, CLIs, hotseat apps, or AI systems.

### What the engine is not for

Kaboom deliberately does **not**:

- manage player connections or authentication
- store live game sessions
- push real-time updates
- decide time controls or clocks
- provide UI/animation logic

Those concerns live in external adapters.

---

## Intended consumers

The engine is designed to be used by “orchestrators,” such as:

- **Stateful game server:** holds the current `GameSnapshot`, receives turns from clients, validates/resolves/applies them, and broadcasts the new snapshot.
- **CLI / file-based workflows:** read a snapshot from disk, apply a turn, write a new snapshot (play-by-email, debugging, regression tests).
- **Hotseat app:** a single process that manages UI state and calls the engine locally.
- **AI player:** needs move generation and simulation (enumerate legal turns, evaluate outcomes).

The same core functions should work for all of these.

---

## Data model (protobuf-first)

All runtime data is defined in protobuf under `src/kaboom/proto/*.proto` and generated into TypeScript under `src/kaboom/proto/gen/` (via `ts-proto`).

### The immutable snapshot

The canonical state is `GameSnapshot`:

- game properties (ID, variant)
- players
- boards (+ per-board active color)
- pieces (with `Place` locations: on-board, captured, benched)
- turn history (`ExecutedTurn`)
- flags (derived / terminal conditions)

The engine treats the snapshot as immutable input and produces a new snapshot as output.

### Turns: intended → resolved → executed

Kaboom distinguishes three levels of “a turn,” each with a different purpose:

- **`IntendedTurn`**: what a player asked to do (syntactic request).
- **`ResolvedTurn`**: an intended turn after validation, expanded into concrete **effects**.
- **`ExecutedTurn`**: a resolved turn recorded into history with an execution timestamp.

This separation is not ceremonial; it supports:

- validating player intent without mutating state
- inspecting/previewing outcomes (e.g., UI highlight, AI search)
- producing a tamper-evident audit log

### Effects: what actually changes state

Rules are expressed as **effects** (`Effect`), which contain **state changes** applied to the snapshot.

A single `Effect` is treated as simultaneous (all its state changes happen “at once”). A turn can contain multiple effects, which apply sequentially.

This is how the engine represents collisions, explosions, chain bumps, multi-step abilities, and complex turn resolution while staying deterministic.

---

## Core pipeline (pure transformers)

The planned public API is a small set of pure functions. Names are illustrative; the exact export surface will be finalized later.

### 1) Resolve a player’s intent

**Input:** `GameSnapshot` + `IntendedTurn`

**Output:** `ResolvedTurn` (or a structured error)

Responsibilities:

- validate that `player_id` is a participant on the relevant board(s)
- validate turn ownership (matches `board.active_color` for the board being played)
- validate that requested moves are well-formed for the current variant
- expand the intended moves into a sequence of effects
  - movement
  - bumps / chain bumps
  - captures / bench transfers
  - explosions / novas
  - flag creation/deletion
  - active-color update

Notes on purity:

- timestamps (`intended_at`, `resolved_at`) are inputs provided by the caller
- resolution must not consult global state or wall-clock time

### 2) Apply a resolved turn

**Input:** `GameSnapshot` + `ResolvedTurn`

**Output:** a new `GameSnapshot` (or error)

Responsibilities:

- apply each effect in order
- apply each effect’s state changes simultaneously
- enforce snapshot invariants after each effect (e.g., no two pieces share a square)
- append an `ExecutedTurn` to `turn_history` (execution time provided by caller)

### 3) Generate legal turns

**Input:** `GameSnapshot` + `board_id` (and optionally a player)

**Output:** a list of legal `IntendedTurn`

Responsibilities:

- enumerate candidate moves for the active player
- filter by legality under the current ruleset
- emit turns in a stable, deterministic order (important for AI and reproducible tests)

Move generation is treated as “first-class,” not an afterthought, because AI simulation and UX need it.

---

## Rulesets and layering

Kaboom supports multiple variants behind a shared engine surface.

### Variant modules

Each ruleset is expected to provide the same conceptual operations:

- validate/normalize moves
- resolve moves into effects
- generate legal turns

The engine core provides shared utilities (board math, ray-casting, bump resolution, effect application, invariant checking), while the ruleset decides what is legal and which effects to emit.

### Variant granularity

The protobuf currently has a coarse `Variant` enum (`CLASSIC`, `KABOOM`). Subvariants (2-player Kaboom, 4-player Kaboom, Nukeboom) are expected to be modeled via:

- additional properties/flags, and/or
- explicit variant expansion later (if/when it becomes stable)

The architecture is designed so that adding a variant does not require changing the pipeline.

---

## Determinism and reproducibility

Determinism is a design constraint, not a preference.

To keep snapshots reproducible across machines and runtimes:

- all ordering-dependent operations must be defined (piece iteration order, tie-breaks)
- effect application must be stable
- move generation must use stable ordering

This enables:

- “golden file” tests (expected snapshot outputs)
- deterministic AI rollouts
- reliable networked play (server authoritative)

---

## Adapters (not yet implemented)

The core engine should be usable as:

- a **TypeScript library** (`import { … } from 'kaboom'`)
- a **CLI** (`kaboom` reading/writing snapshot files)
- a **gRPC service**
- a **REST service**

Only the library core must remain pure and stateless. Adapters may be stateful.

A useful way to think about it:

- **Core:** protobuf in/out, pure functions
- **Edge:** transport, auth, persistence, matchmaking, UI

---

## Repository layout (TypeScript)

- `src/kaboom/proto/*.proto` — protobuf source of truth
- `src/kaboom/proto/gen/` — generated TS types (checked in or generated during build)
- `src/kaboom/proto/index.ts` — convenience export for generated types
- `src/kaboom/cli/` — CLI entry point (currently a scaffold)
- `protobuf_ts.sh` — protobuf → TypeScript generation script (`ts-proto`)

---

## Testing strategy (planned)

The architecture is designed to make testing boring (a compliment):

- **Property tests:** invariants always hold (no duplicate occupancy, valid board bounds, etc.).
- **Golden tests:** known snapshots + turns produce exact expected snapshots.
- **Rule conformance tests:** small position setups for each special move (bump chains, nova, snipe).
- **Replay tests:** applying turn history reproduces the final snapshot.

---

## Invariants (engine-level contracts)

The core will enforce a small set of invariants after applying effects:

- Every on-board piece occupies exactly one square.
- No two on-board pieces share the same square.
- Off-board pieces must be in a well-defined zone (captured/benched) with a holder.
- `board.active_color` must always be a real color for an active board.
- Turn history must refer to valid moves/effects.

Rulesets may impose additional constraints (e.g., classic legality, Kaboom deploy limits).

---

## Status

This TypeScript repo currently contains:

- protobuf schema for snapshots, turns, moves, and effects
- TypeScript generation tooling (ts-proto)
- a minimal CLI scaffold

The rule evaluation and move generation implementations are intentionally not present yet; they will be added as pure transformer modules that follow the pipeline described above.
