---
type: Specification
description: Parser for TSV format by delegating to parseCSV with tab delimiter.
file: src/parsers/tsv.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
  - src/parsers/csv.ts
---

# `src/parsers/tsv.ts` Specification

## Overview
Parser for TSV format delegating to `parseCSV` with tab delimiter.

### (Function) `parseTSV`
- **Description**: Parses TSV string into TehbrIR by delegating to parseCSV with tab delimiter.
- **Arguments**:
  - `content: string`: Raw TSV content.
  - `options?: { noHeader?: boolean }`: Option to treat 1st row as data.
- **Return Value**: `Promise<TehbrIR>`
