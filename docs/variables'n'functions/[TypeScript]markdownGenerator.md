---
type: Specification
description: Generator for Markdown table format with East Asian Width padding calculations.
file: src/generators/markdown.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/generators/markdown.ts` Specification

## Overview
Generator for Markdown table format with East Asian Width padding calculations.

### (Function) `generateMarkdown`
- **Description**: Generates formatted Markdown table string from TehbrIR.
- **Arguments**:
  - `ir: TehbrIR`: TehbrIR object.
- **Return Value**: `string`
