---
type: Specification
description: Parser for CSV/TSV format using csv-parse.
file: src/parsers/csv.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/parsers/csv.ts` Specification

## Overview
Parser for CSV and TSV format using csv-parse.

### (Function) `parseCSV`
- **Description**: Parses CSV/TSV string into TehbrIR.
- **Arguments**:
  - `content: string`: Raw CSV/TSV content.
  - `options?: { noHeader?: boolean; delimiter?: string }`: Options to treat 1st row as data and set column delimiter.
- **Return Value**: `Promise<TehbrIR>`
