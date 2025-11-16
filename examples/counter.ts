import { TemplateBinder } from '../src/template.js';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// Example 2: Counter with Events (with auto-update enabled)
// Notice: No need to call binder2.update() in event handlers!
const state2: CounterState = {
  count: 0,
  increment: function(): void {
    this.count++;
    // update() is called automatically!
  },
  decrement: function(): void {
    this.count--;
    // update() is called automatically!
  },
  reset: function(): void {
    this.count = 0;
    // update() is called automatically!
  }
};

const binder2 = new TemplateBinder('#example2', state2);
binder2.autoUpdate = true; // Enable auto-update as a property
binder2.bind();
