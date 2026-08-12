---
type: Specification
description: Launcher script checking for Bun/Node environments.
file: bin/tehbr.js
tags:
  - "@cli"
imports: []
---

# `bin/tehbr.js` Specification

## Overview
Launcher script checking for Bun/Node environments.

### (Function) `runLauncher` (L13-25)
- **Description**: Checks for `bun -v` and spawns appropriate process.
- **Arguments**: None
- **Return Value**: `void`