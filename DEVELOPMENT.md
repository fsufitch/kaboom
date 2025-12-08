# Development Guide

This document collects everything you need to contribute to Kaboom: the recommended environment, how to regenerate generated sources, and how to run the main binaries.

## Environment

The repo ships with a `.devcontainer/` setup. Using it is the fastest way to get a working toolchain (Go, protoc, ts-proto, Node):

1. Install [Visual Studio Code](https://code.visualstudio.com/) plus the **Dev Containers** extension.
2. Open the repository folder in VS Code.
3. When prompted, select **Reopen in Container** (or run the *Dev Containers: Reopen in Container* command manually). The container installs the dependencies declared in `devcontainer.json`.
4. Work inside the container; terminals and editors now share the preconfigured Go toolchain.

### Local setup (optional)

If you cannot use the devcontainer, install the following locally:

- Go `1.24.x` or newer (`go` command must be on `PATH`).
- Protocol Buffers compiler (`protoc`).
- Go protobuf plugin (`go install google.golang.org/protobuf/cmd/protoc-gen-go@latest`).
- Node.js + npm (for `proto/ts` if you need TypeScript bindings).

## Regenerating Protobuf Bindings

Edit proto definitions under `proto/src/*.proto`, then regenerate language bindings:

```bash
# Go bindings (outputs to proto/go)
./proto/protobuf_go.sh

# TypeScript bindings (outputs to proto/ts/src and runs npm build)
pushd proto/ts
npm install          # first time only
popd
./proto/protobuf_ts.sh
```

Both scripts verify that `protoc` and the required plugins are available before generating code.

## Building and Running

All commands assume you are at the repository root.

### Tests

```bash
go test ./...
```

To keep build artifacts inside the workspace (useful inside certain sandboxes), set `GOCACHE`:

```bash
GOCACHE=$(pwd)/.cache go test ./...
```

### REPL CLI

```bash
go run ./cmd/kaboom-repl
```

The REPL bootstraps a new classic game, accepts REPL-style input, and prints the board plus effect summaries.

### HTTP Server

```bash
go run ./cmd/kaboom-server
# optional overrides:
#   KABOOM_HOST=0.0.0.0 KABOOM_PORT=9000 go run ./cmd/kaboom-server
```

The server exposes the stateless endpoints described in `README.md`.

### Code Generation / Formatting

- Go formatting: `gofmt -w <files>` (or rely on your editor’s format-on-save).
- No other code generators currently exist; everything else is plain Go.

## Repository Layout Cheat Sheet

- `classic/` – Move/Intent/Effect rules for the classic chess variant plus helpers for seeding starting positions.
- `kaboomstate/` – Go wrappers around the protobuf messages (validation helpers, constructors, serializers).
- `server/` – HTTP handlers registered by `cmd/kaboom-server`.
- `cmd/` – Entry points (`kaboom-repl`, `kaboom-server`).
- `proto/` – Protobuf sources and generation scripts for Go/TypeScript clients.
- `RULES.md` – Human-readable variant rulebook.

Refer back to this document whenever you need to reconfigure the tooling or regenerate bindings.
