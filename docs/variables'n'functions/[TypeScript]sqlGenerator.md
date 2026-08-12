---
type: Specification
description: Generator for ANSI SQL format generating CREATE TABLE and INSERT INTO statements.
file: src/generators/sql.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/generators/sql.ts` Specification

## Overview
Generator for ANSI SQL format (`CREATE TABLE` and `INSERT INTO` statements).

### (Function) `generateSQL`
- **Description**: Generates SQL CREATE TABLE and INSERT INTO statements from TehbrIR.
- **Arguments**:
  - `ir: TehbrIR`: TehbrIR object.
  - `options?: { tableName?: string }`: Optional table name override.
- **Return Value**: `string`
