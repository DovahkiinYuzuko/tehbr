---
type: Specification
description: Format Registry for table parsers.
file: src/parsers/index.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/parsers/index.ts` Specification

## Overview
Format Registry for table parsers.

### (Function) `parseContent`
- **Description**: Dispatcher to parse input string based on specified format.
- **Arguments**:
  - `format: string`: Input format (`csv`, `tsv`, `markdown`, `html`, `json`, `ir`).
  - `content: string`: Raw content.
  - `options?: { noHeader?: boolean }`: Options for CSV/TSV.
- **Return Value**: `Promise<TehbrIR>`
