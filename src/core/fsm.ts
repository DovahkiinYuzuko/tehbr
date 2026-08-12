import type { CLIState } from './types.js';

export class CLIFSM {
  private currentState: CLIState = 'Idle';

  public getState(): CLIState {
    return this.currentState;
  }

  public transitionTo(nextState: CLIState): void {
    this.currentState = nextState;
  }

  public cancel(): void {
    this.currentState = 'Cancelled';
  }
}
