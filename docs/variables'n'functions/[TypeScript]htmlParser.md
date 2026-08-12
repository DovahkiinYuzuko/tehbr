---
type: Specification
description: Parser for HTML table format.
file: src/parsers/html.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/parsers/html.ts` Specification

## Overview
Parser for HTML `<table>` format.

### (Function) `parseHTML`
- **Description**: Parses HTML `<table>` content into TehbrIR.
- **Arguments**:
  - `content: string`: Raw HTML string containing `<table>`.
- **Return Value**: `TehbrIR`
