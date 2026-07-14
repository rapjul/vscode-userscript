# Speeding Up the VS Code Extension Test Suite

This document outlines strategies, packages, and methodologies to optimize and speed up the testing workflows for `vscode-scriptmonkey`.

---

## 1. Upgrade to the New Official VS Code Test CLI (`@vscode/test-cli`)

VS Code has introduced a configuration-driven CLI runner (`@vscode/test-cli`) that replaces legacy manual bootstrap scripts (e.g., `runTest.ts` and `suite/index.ts`).

### Benefits

- **Watch Mode (`--watch`)**: Keeps the VS Code window open and dynamically re-runs tests on changes. This eliminates the multi-second startup delay of launching Electron repeatedly.
- **Selective Runs**: Support for targeting specific files or using regular expressions (via Mocha's `--grep`) directly from the CLI.

### Migration Plan

1. **Install the CLI**:

   ```bash
   npm install --save-dev @vscode/test-cli
   ```

2. **Create configuration (`.vscode-test.mjs`)**:
   Create a `.vscode-test.mjs` file at the project root:

   ```javascript
   import { defineConfig } from '@vscode/test-cli';

   export default defineConfig({
     files: 'out/test/suite/**/*.test.js',
     mocha: {
       ui: 'tdd',
       color: true
     }
   });
   ```

3. **Update scripts in `package.json`**:

   ```json
   {
     "scripts": {
       "test": "vscode-test"
     }
   }
   ```

---

## 2. Separate Unit Tests from VS Code Integration Tests

Integration tests must be executed inside a running VS Code host because they import the `'vscode'` module. This process takes 1–3 seconds just to launch the Electron instance.

Pure logic functions (such as `checkIfShouldRun` in `src/utils/checkIfShouldRun.ts`) do not require the VS Code host if mock objects are provided.

### Optimization Strategy

1. **Mock VS Code Types**: Use a mocking library such as `jest-mock-vscode` or manual stubs to mock necessary VS Code objects (like `Range`, `TextDocument`, `TextLine`).
2. **Setup a Lightweight Runner**: Configure a fast runner like **Vitest** or **Bun Test** to run pure logic tests.
3. **Execute in Milliseconds**: Run unit tests under Node or Bun directly:
   - **Vitest/Bun Test run time**: < 100ms.
   - **Integration test run time**: 2–3s (only run when VS Code APIs are actually being executed).

---

## 3. Speed Up Compilation with a Fast Compiler (`esbuild` or `swc`)

Currently, tests depend on `npm run compile` which runs `tsc -p ./`. The standard TypeScript compiler (`tsc`) performs full type checking, which makes watch and build processes relatively slow.

### Optimization Strategy

- **During Development/Testing**: Use **`esbuild`** or **`swc`** to transpile TypeScript to JavaScript instantly (under 50ms).
- **During CI/Packaging**: Retain `tsc` to perform strict type checking before bundling the final extension.
