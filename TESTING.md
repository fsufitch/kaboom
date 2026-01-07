# Testing

## Strategy
- Tests are fast, source-based unit tests that run without a build step.
- Each package keeps tests in `tests/` alongside `src/` so bundling never includes tests.
- The first real suite lives in `@kaboom/engine` and targets classic bishop capture rules.
- Other packages currently use placeholder tests to keep workspace-wide runs green.

## Setup
- Install dependencies once at the repo root:
  - `pnpm install`
- `@kaboom/engine` tests depend on generated proto code; the engine test script runs `pnpm -C packages/proto generate` automatically.

## Running tests
- Engine tests (includes the bishop capture suite):
  - `pnpm -C packages/engine test`
- Proto tests (placeholder):
  - `pnpm -C packages/proto test`
- CLI tests (placeholder):
  - `pnpm -C packages/cli test`
- Run all workspace tests:
  - `pnpm -r run test`
- Watch mode (package-local):
  - `pnpm -C packages/engine test:watch`
  - `pnpm -C packages/proto test:watch`
  - `pnpm -C packages/cli test:watch`

## Coverage
- Engine coverage (reports to `coverage/engine`):
  - `pnpm -C packages/engine coverage`
- Proto coverage (default Vitest output under `packages/proto/coverage`):
  - `pnpm -C packages/proto coverage`
- CLI coverage (default Vitest output under `packages/cli/coverage`):
  - `pnpm -C packages/cli coverage`
