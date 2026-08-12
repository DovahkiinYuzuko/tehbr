---
type: Specification
description: Format Registry for table generators.
file: src/generators/index.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/generators/index.ts` Specification

## Overview
Format Registry for table generators.

### (Function) `generateContent`
- **Description**: Dispatcher to render TehbrIR to specified output format.
- **Arguments**:
  - `format: string`: Output format (`csv`, `tsv`, `markdown`, `html`, `json`, `sql`, `ir`).
  - `ir: TehbrIR`: TehbrIR object.
  - `options?: { tableName?: string }`: Options for generator (e.g. SQL table name).
- **Return Value**: `string`
