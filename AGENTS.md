# Hello AI Agents!

So you're here to work with my code. Great! Below you'll find some instructions to help you get started.

## What this project is

Kaboom is a headless, stateless TypeScript rules engine for classic chess and Kaboom chess variants. It operates on immutable `GameSnapshot` data defined in protobuf schemas, validating and resolving turns into deterministic effects and producing new snapshots. The codebase is designed to be embedded in other systems (servers, CLIs, UIs, AI tooling), and includes the core engine, protobuf schema/tooling, and a CLI scaffold.

## Crucial concepts and context

Getting started as an agent, follow these steps:

- Consult README.md for an overview of the project.
- Consult ARCHITECTURE.md for architectural details.
- Consult KABOOM.md for rules specific to Kaboom Chess.
- Consult the `packages/proto` directory for Protobuf schemas defining the data structures central to the engine.

The design pattern of the engine is functional and stateless.

- `GameSnapshot` is the core data structure, containing everything about a chess game (pieces, board state, turn history, etc.).
- The engine processes turns and produces new snapshots without side effects.
- The engine and rule system is designed to be modular and composable, allowing it to be embedded in various environments (servers, CLIs, UIs, AI systems). Also, allowing it to implement chess variants like Kaboom Chess.
- Refer to ARCHITECTURE.md for more details on these concepts.
- The immutable state model is fully described by Protobuf schemas in `packages/proto/src/kaboom/proto/`. These are compiled to TypeScript types used throughout the codebase.

Currently, the engine only supports "classic" chess rules, in order to establish a solid foundation. When dealing with Kaboom-specific rules in the future, refer to KABOOM.md.

## Development setup

The project is designed to be developed using a devcontainer. See the files in `.devcontainer/` for details. When using VS Code (using a Codex, Copilot, or other AI agent), the devcontainer should be automatically detected and used.

If a devcontainer is not used, ensure you have Node.js (version 22 or later preferred) and pnpm installed. Then run `pnpm install` in the project root to install dependencies.

You may need to install additional "system" dependencies depending on your OS and environment. Consult the devcontainer files for hints on what may be needed.

## Code validation

The project uses linting and testing to ensure code quality.

- Type checking is done with TypeScript. Run `pnpm build` to check for type errors.
- Linting is done with ESLint. Run `pnpm lint` to check for issues, and `pnpm lint:fix` to automatically fix some issues.
- Formatting is done with Prettier. Run `pnpm format` to format code.
- Testing is done with Vitest. See TESTING.md for details on running tests and the testing strategy.

When making changes, ensure that linting passes, formatting is correct, and all tests pass.

If the user/dev driving the process indicates that there is a mismatch in behavior between the CLI tooling and IDE behavior, proactively suggest ways to bring them into alignment. For example, the VSCode `protobuf.protoc.path` setting is best set to use `packages/proto/node_modules/.bin/protoc` to ensure the same version of `protoc` is used in both CLI and IDE contexts... but that may not be possible in all environments.

## Code standards

- Follow existing code style and conventions.
- Write clear, concise, and well-documented code.
- Use TypeScript features effectively.
- Avoid `any` and `unknown` types, and all other type escapes. If you must use them, clearly comment why.
- Write unit tests for new functionality and bug fixes.
- Avoid all ".." imports. They are fragile and make file-moving difficult. Use package names or absolute imports instead.
- Avoid hard-coding aliases or "one-off" paths. Use existing utilities or create new ones as needed. Alternatively, prefer plugins that automatically resolve things for you.
- Configuration, settings, and especially declarative setup (package.json, tsconfig.json, eslint.config.js, etc.) should have a strong emphasis on "single source of truth" and "don't repeat yourself". If something is defined in one place, avoid redefining it elsewhere. Instead, reference or import the original definition.
- Do not add new dependencies without discussing them first. This project is meant to be a lightweight portable engine and runtime, so dependencies should be carefully considered.
- When in doubt, ask! It's better to ask questions than to make assumptions that may lead to rework later.
- Remember that you are an agent working on behalf of a human user/dev. Always prioritize their goals and preferences, and seek clarification when needed.
