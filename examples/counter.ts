import { TemplateBinder } from '../src/template.js';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

// Example 2: Counter with Events
const state2: CounterState = {
  count: 0,
  increment: function() {
    this.count++;
    binder2.update();
  },
  decrement: function() {
    this.count--;
    binder2.update();
  },
  reset: function() {
    this.count = 0;
    binder2.update();
  }
};

const binder2 = new TemplateBinder('#example2', state2);
binder2.bind();
