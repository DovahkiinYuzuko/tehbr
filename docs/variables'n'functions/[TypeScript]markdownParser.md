---
type: Specification
description: Parser for Markdown table format.
file: src/parsers/markdown.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/parsers/markdown.ts` Specification

## Overview
Parser for Markdown table format.

### (Function) `parseMarkdown`
- **Description**: Parses Markdown table string into TehbrIR.
- **Arguments**:
  - `content: string`: Raw Markdown table content.
- **Return Value**: `TehbrIR`
