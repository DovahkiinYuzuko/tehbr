---
type: Specification
description: Parser for JSON format (array of objects) converting into TehbrIR with stringification and key union padding.
file: src/parsers/json.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/parsers/json.ts` Specification

## Overview
Parser for JSON format (array of objects) converting into TehbrIR. Values are stringified with `String()` and missing keys are padded with `""`.

### (Function) `parseJSON`
- **Description**: Parses JSON array of objects string into TehbrIR.
- **Arguments**:
  - `content: string`: Raw JSON content.
- **Return Value**: `TehbrIR`
