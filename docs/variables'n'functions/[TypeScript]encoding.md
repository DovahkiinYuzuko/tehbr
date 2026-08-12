---
type: Specification
description: Multilingual buffer decoding utility using iconv-lite for convert input binary buffers to UTF-8 strings.
file: src/utils/encoding.ts
tags:
  - "@core"
  - "@encoding"
imports:
  - iconv-lite
---

# `src/utils/encoding.ts` Specification

## Overview
Multilingual input buffer decoding utility supporting `iconv-lite` encodings (e.g. `shift_jis`, `euc-jp`, `gbk`, `big5`, `euc-kr`, `windows-1252`, `utf-16`) with UTF-8 / UTF-16 BOM detection.

### (Function) `decodeBuffer` (L3-24)
- **Description**: Decodes input `Buffer` into a UTF-8 JavaScript string.
- **Arguments**:
  - `buffer: Buffer`: Raw input binary data.
  - `encoding?: string`: Target encoding name (e.g., `'shift_jis'`, `'gbk'`). Defaults to UTF-8 with BOM auto-detection if omitted.
- **Return Value**: `string` (UTF-8)