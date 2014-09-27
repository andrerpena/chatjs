// represents an object that has state
interface IStateObject<TState> {
    getState(): TState;
    setState(state: TState, triggerStateChangedEvent: boolean): void;
}

// represents a window
// It implements ISateObject and the state is whether or not it's maximized
interface IWindow<TState> extends IStateObject<TState> {
    // sets the right offset, that is, the distance from this window to the right edge of the window
    setRightOffset(offset: number): void;
    // returns the window width
    getWidth():number;
    // sets focus on the window
    focus():void;
}