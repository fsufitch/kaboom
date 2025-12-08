# Kaboom

Kaboom is a stateless chess rules engine that runs entirely on data you provide. It understands multiple rulesets (the `classic` chess ruleset is currently implemented) and exposes a set of pure functions that turn moves into validated effects without keeping server-side session state.

Read the variant-specific rules in [RULES.md](./RULES.md); this document explains how the engine itself is structured and how to use it.

## Data Model

The Protobuf definitions under `proto/src/` describe all runtime data. Go-friendly wrappers live under `kaboomstate/` and add validation plus helper methods.

Key types:

- **Game** – the whole snapshot: rules variant, boards, players, pieces currently in play, and historical turns.
- **Board** – the playing surface. A game may contain multiple boards in other variants.
- **Player** – identity plus metadata. Stored by UUID and referenced from moves/intents.
- **ChessPiece** – kind, color, location (board, zone, position).
- **Move** – what a player typed/selected. Moves are syntactic: they describe an action before rules interpretation.
- **Intent** – the adjudicated meaning of a move (“this pawn moves from D2 to D4”). Every intent is tied to one acting player.
- **Effect** – concrete state mutations (“piece moved”, “piece captured”, “win”). Effects are what mutate the immutable `Game` snapshot into the next one.
- **Turn** – recording of intents and their resulting effects for auditing.
- **Zones** – pieces never disappear; they move between zones. `ZONE_BOARD` is the active board, `ZONE_GRAVEYARD` holds captures, `ZONE_BENCH` covers deployable reserves, and `ZONE_TEMPORARY` can model out-of-band states.
- **Visual Hints** – optional metadata attached to effects describing how a client might visualize them (collision, explosion, stomp, snipe, nova, mind-control beams, disintegration, yeet trajectories). They share timing metadata so a UI can sequence them.

Everything is immutable: the engine returns new protos instead of mutating existing ones.

A high-level “shape” of the serialized data looks like:

```text
Game {
  rulesVariant: "classic"
  boards: [ Board { uuid, playerColors[], ... }, ... ]
  players: [ Player { uuid, name, ... }, ... ]
  pieces: [ ChessPiece { uuid, kind, color, boardUuid, zone, position? }, ... ]
  turns: [
    Turn {
      uuid, playerUuid
      intents: [
        Intent {
          uuid, actingPlayerUuid,
          pieceMove | pieceTransfer | resign
        }, ...
      ]
      effects: [
        Effect {
          uuid, boardUuid, why,
          nothingHappens | pieceMoved | pieceCaptured | ...,
          visualHints[]
        }, ...
      ]
    }, ...
  ]
}
```

## Turn Pipeline

Each move goes through the same state machine:

1. **Move ➞ Intent** – `VariantAdjudicator.MoveToIntent` runs the configured rules for the active variant until one produces an intent.
2. **Intent ➞ Effects** – `VariantAdjudicator.IntentToEffects` expands the intent into one or more effects.
3. **Apply Effects** – `kaboomstate.ApplyEffects` folds the effect list over the incoming `Game` to produce a new validated game snapshot.

This is all pure computation. You can pause after any step, inspect the data, branch, or roll back simply by choosing which serialized state to send forward.

## Code Layout

- `kaboomstate/` – thin Go wrappers around the generated protobufs (validation, helpers, serialization helpers).
- `classic/` – the “classic chess” ruleset: Move→Intent and Intent→Effect rules, plus helpers like `NewClassicChessGame`.
- `server/` – HTTP handlers that expose the stateless API described below.
- `cmd/` – command-line entry points (`kaboom-repl`, `kaboom-server`).
- `proto/` – source `.proto` files plus scripts for regenerating Go and TypeScript bindings.
- `RULES.md` – high-level description of the currently implemented variant.

## Using the CLI (REPL)

The REPL walks through the pipeline locally so you can test moves by hand.

```bash
go run ./cmd/kaboom-repl
```

Commands:

- Enter moves like `P M D2 D4`, `N C G1 F3`, `K O E1 S` (details in `printHelp()`).
- `board` prints the current Unicode chessboard.
- `help` reprints the quick guide; `exit` or `quit` leaves the program.

Each move is parsed, adjudicated via the classic rules, and applied to the in-memory game snapshot.

## Using the HTTP API

Start the API server:

```bash
go run ./cmd/kaboom-server
# or set KABOOM_HOST / KABOOM_PORT first
```

Endpoints (all `POST` unless stated otherwise):

| Path | Purpose | Request Body | Response |
| --- | --- | --- | --- |
| `/new-game?variant=classic` | Returns the initial `Game` proto for the chosen variant. | Empty body. | Raw JSON-serialized proto. |
| `/parse-repl-move` | Parses a REPL string into a `KaboomMove`. | `{"replMove": "P M D2 D4"}` | `{"ok":true,"error":"","move":{...}}` |
| `/move-to-intent?variant=classic` | Converts a move into an intent for the supplied game. | `{"game":{...proto...},"move":{...proto...}}` | `{"ok":true,"error":"","intent":{...}}` |
| `/intent-to-effect?variant=classic` | Converts an intent into concrete effects. | `{"game":{...},"intent":{...}}` | `{"ok":true,"error":"","effects":[{...}]}` |
| `/apply-effects` | Applies effects to the supplied game snapshot. | `{"game":{...},"effects":[{...}]}` | `{"ok":true,"error":"","game":{...}}` |
| `/evaluate-move?variant=classic` | Full pipeline helper. | `{"game":{...},"replMove":"P M D2 D4"}` or `{"game":{...},"move":{...}}` | `{"ok":true,"error":"","game":{...}}` |

Every helper returns JSON with `ok`/`error` plus a payload key (`move`, `intent`, `effects`, or `game`). Errors that stem from bad input use HTTP 400, while unexpected failures surface as HTTP 500 with `ok:false`.

## Development

Detailed setup instructions live in [DEVELOPMENT.md](./DEVELOPMENT.md) and cover:

- Using the devcontainer for a consistent toolchain.
- Regenerating Go/TypeScript protobuf bindings.
- Building/running the CLIs and HTTP server.
- Running tests.

Refer to that document when working on the engine itself.
