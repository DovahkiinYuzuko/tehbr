---
type: Specification
description: Data type definitions for Intermediate Representation (tehbr IR).
file: src/core/types.ts
tags:
  - "@core"
imports: []
---

# `src/core/types.ts` Specification

## Overview
Data type definitions for Intermediate Representation (tehbr IR).

### (Type) `Alignment` (L1-1)
- **Description**: Column text alignment options.
- **Value**: `'left' | 'center' | 'right'`

### (Interface) `TehbrIR` (L3-7)
- **Description**: Intermediate Representation for table data.
- **Properties**:
  - `headers: string[]`: Array of header names.
  - `rows: string[][]`: 2D array of table row data.
  - `alignments?: (Alignment | null)[]`: Optional array of column alignments.