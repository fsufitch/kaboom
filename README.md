# kaboom

> **Disclaimer:** This is an AI-generated summary that has not yet been vetted for accuracy.

Kaboom Chess is an experimental chess variant that extends standard play with additional “Kaboom” abilities. Read about the new rules at [RULES.md](./RULES.md). The codebase contains:

- Protocol Buffer definitions (`proto/`) for game state, pieces, and moves.
- Go wrappers over the proto types providing validation, helper methods, and move construction.
- CLI examples under `cmd/`:
  - `kaboom-example` loads a sample in-progress game from `examples/` and validates/prints it.
  - `kaboom-example-start` accepts a JSON chessboard description (e.g., `chessboard_start.json`) and spins up a new TwoPlayerGame for Alice vs. Bob.
- TypeScript bindings generated via `ts-proto` in `proto/ts`.

### Development Workflow

It is recommended to work inside the provided devcontainer configuration, which comes with the correct Go toolchain, Protocol Buffers compiler/plugins, Node.js dependencies, and editor extensions preinstalled.

1. Edit proto definitions in `proto/src/`.
2. Regenerate Go code with `proto/protobuf_go.sh` and TypeScript stubs with `proto/protobuf_ts.sh`.
3. Run `go test ./...` to verify validation logic and helpers.
4. Use the CLIs under `cmd/` to inspect game states and their serialized boards.

### Features

- Move registry for both classical and Kaboom-specific moves (bumps, stomps, nova, control, etc.).
- Validation pipeline that ensures board integrity, piece positions/colors, move history, and player references are consistent.
- Chessboard serializer that renders the current board state with Unicode pieces and coordinate labels.
