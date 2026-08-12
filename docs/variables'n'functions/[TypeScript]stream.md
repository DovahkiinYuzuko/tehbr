---
type: Specification
description: Streaming pipeline engine for low-memory O(1) processing of large table files using Node.js Transform streams.
file: src/core/stream.ts
tags:
  - "@core"
  - "@streaming"
imports:
  - stream/promises
  - stream
---

# `src/core/stream.ts` Specification

## Overview
Streaming pipeline engine utilizing `node:stream/promises` and `Transform` streams for low-memory $O(1)$ space complexity processing of large CSV, TSV, NDJSON, JSON, and SQL table conversions.

### (Interface) `StreamOptions` (L10-18)
- **Properties**:
  - `inputPath?: string`: Input file path or undefined for stdin.
  - `outputPath?: string`: Output file path or undefined for stdout.
  - `inputFormat: string`: Format of input data (`csv`, `tsv`, `json`, `ndjson`).
  - `outputFormat: string`: Format of output data (`csv`, `tsv`, `json`, `ndjson`, `sql`).
  - `tableName?: string`: Table name for SQL output.
  - `noHeader?: boolean`: Treat CSV/TSV 1st row as data.

### (Function) `runStreamPipeline` (L42-196)
- **Description**: Connects readable stream, transform parser, transform generator, and writable stream using `pipeline()`.
- **Arguments**:
  - `options: StreamOptions`: Configuration options.
- **Return Value**: `Promise<void>`