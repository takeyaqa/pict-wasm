# Agent Instructions for pict-wasm

## Overview

WebAssembly build of Microsoft PICT (Pairwise Independent Combinatorial Testing) that works in Node.js and browsers.

## Build and Test Commands

```bash
# Set up Emscripten SDK (required for first-time setup)
mise install

# Install dependencies and Playwright browsers
pnpm install
pnpm exec playwright install --with-deps

# Build WASM and TypeScript
pnpm run build

# Lint and format
pnpm run fmt
pnpm run lint
pnpm run typecheck

# Run all tests once (Node.js + browsers via Playwright)
pnpm run test:run
```

## Architecture

This project wraps Microsoft's C++ PICT tool as a WebAssembly module with a TypeScript API.

### Two Build Systems

1. **Emscripten (WASM)** - Compiles C++ to WebAssembly via `make wasm`. Uses `em++` with specific flags in `Makefile`.
2. **TypeScript** - Compiles `wasm-src/*.ts` to `dist/` via `tsc`.

### Directory Structure

- `api/`, `cli/` - Original PICT C++ source (from Microsoft, read-only in principle)
- `wasm-src/` - TypeScript wrapper source
- `wasm-work/` - Intermediate WASM build objects
- `dist/` - Build output (WASM + JS + types)
- `wasm-test/` - Vitest tests run in Node.js + 3 browsers

### Key Components

- `PictRunner` class - Async factory pattern (`PictRunner.create()`) to initialize WASM
- Uses Emscripten's virtual filesystem (`pict.FS.writeFile`) to pass model files
- Custom error classes map C++ error codes to typed JavaScript errors

## Key Conventions

- **Git Workflow**: Always create a new branch from `develop` before starting any task
- **Node 22+**: Required runtime version
- **pnpm 10**: Required package manager
- **Strict TypeScript** - `tseslint/strictTypeChecked` for source, `tseslint/recommended` for tests
- **oxfmt** for formatting
- Tests run in 4 environments: Node.js, Chromium, Firefox, WebKit
- **Commit Messages**: Use Conventional Commits format (e.g., `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:`)
- **Before committing** - Always run `pnpm run fmt`, `pnpm run lint`, `pnpm run typecheck`, and `pnpm run test:run`
- **Ignore `pnpm-lock.yaml`** - Always skip this file during code review and pull request creation
