---
type: Specification
description: Cross-platform system clipboard utility for reading and writing text using native OS commands.
file: src/utils/clipboard.ts
tags:
  - "@cli"
imports:
  - child_process
---

# `src/utils/clipboard.ts` Specification

## Overview
Cross-platform system clipboard utility for reading and writing text without third-party external library dependencies.

### (Function) `readClipboard` (L4-34)
- **Description**: Reads plain text from system clipboard using OS native commands.
- **Arguments**: None
- **Return Value**: `string`

### (Function) `writeClipboard` (L36-70)
- **Description**: Writes plain text to system clipboard using OS native commands.
- **Arguments**:
  - `text: string`: Text to write to clipboard.
- **Return Value**: `void`