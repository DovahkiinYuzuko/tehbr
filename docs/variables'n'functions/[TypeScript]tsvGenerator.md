---
type: Specification
description: Generator for TSV format by delegating to generateCSV with tab delimiter.
file: src/generators/tsv.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
  - src/generators/csv.ts
---

# `src/generators/tsv.ts` Specification

## Overview
Generator for TSV format by delegating to `generateCSV` with tab delimiter.

### (Function) `generateTSV`
- **Description**: Generates TSV string from TehbrIR by calling generateCSV with tab delimiter.
- **Arguments**:
  - `ir: TehbrIR`: TehbrIR object.
- **Return Value**: `string`
