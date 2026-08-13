---
type: Specification
description: CLI argument parsing and pipeline runner using Commander.
file: src/cli/index.ts
tags:
  - "@cli"
imports:
  - src/core/types.ts
  - src/parsers/index.ts
  - src/generators/index.ts
---

# `src/cli/index.ts` Specification

## Overview
CLI argument parsing and pipeline runner using Commander.

### (Function) `detectFormatFromPath`
- **Description**: Detects input/output format string from file extension.
- **Arguments**:
  - `filePath: string`: Path to the file.
- **Return Value**: `string | null`

### (Function) `runCLI`
- **Description**: Parses CLI arguments using Commander (including `--table-name`) and executes direct conversion or interactive mode.
- **Arguments**:
  - `args: string[]`: Command line arguments array.
- **Return Value**: `Promise<void>`
