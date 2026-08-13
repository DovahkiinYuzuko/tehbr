---
type: Specification
description: Comprehensive test runner for CSV, HTML, TSV, Markdown, no-header, and pipeline conversions.
file: test-scripts/test_runner.ts
tags:
  - "@core"
imports:
  - src/parsers/index.ts
  - src/generators/index.ts
---

# `test-scripts/test_runner.ts` Specification

## Overview
Comprehensive test runner for CSV, HTML, TSV, Markdown, --no-header, and pipeline conversions.

### (Function) `runTests` (L44-494)
- **Description**: Executes all test suites and logs results.
- **Arguments**: None
- **Return Value**: `Promise<void>`