export class CLIFSM {
    currentState = 'Idle';
    getState() {
        return this.currentState;
    }
    transitionTo(nextState) {
        this.currentState = nextState;
    }
    cancel() {
        this.currentState = 'Cancelled';
    }
}
