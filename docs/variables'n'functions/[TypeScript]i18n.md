---
type: Specification
description: Provides internationalization (i18n) support by initializing RokeeruLoader and exporting translation helper t.
file: src/i18n/index.ts
tags:
  - "@cli"
  - "@core"
imports:
  - rokeeru
---

# `src/i18n/index.ts` Specification

## Overview
Provides internationalization (i18n) support by initializing `RokeeruLoader` and exporting translation lookup helper function `t`.

### (Function) `initI18n` (L7-11)
- **Description**: Initializes `RokeeruLoader` with specified locale directory and default language.
- **Arguments**:
  - `lang`: `string` (default: `'en'`)
  - `localesDir`: `string` (optional)
- **Return Value**: `Promise<void>`

### (Function) `t` (L13-43)
- **Description**: Retrieves translation message for specified key with parameter interpolation.
- **Arguments**:
  - `key`: `string`
  - `params`: `Record<string, string>` (optional)
- **Return Value**: `string`
