---
type: Specification
description: Generator for CSV format.
file: src/generators/csv.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/generators/csv.ts` Specification

## Overview
Generator for CSV format.

### (Function) `generateCSV`
- **Description**: Generates CSV string from TehbrIR.
- **Arguments**:
  - `ir: TehbrIR`: TehbrIR object.
  - `delimiter?: string`: Delimiter character (default: `','`).
- **Return Value**: `string`
