---
type: Specification
description: Lightweight Finite State Machine (FSM) class for controlling CLI and Interactive UI state transitions.
file: src/core/fsm.ts
tags:
  - "@core"
imports:
  - src/core/types.ts
---

# `src/core/fsm.ts` Specification

## Overview
Lightweight Finite State Machine (FSM) class for controlling CLI and Interactive UI state transitions.

### (Class) `CLIFSM` (L3-3)
- **Description**: FSM manager for state transitions.
- **Methods**:
  - `getState(): CLIState`: Returns current state.
  - `transitionTo(nextState: CLIState): void`: Transitions to the next state safely.
  - `cancel(): void`: Transitions state to `'Cancelled'`.