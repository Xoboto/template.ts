import { TemplateBinder } from '../src/template.js';

type Status = 'active' | 'inactive';

interface DynamicState {
  status: Status;
  toggleStatus: () => void;
}

// Example 5: Dynamic Attributes & Conditionals
const state5: DynamicState = {
  status: 'active',
  toggleStatus: function(): void {
    this.status = this.status === 'active' ? 'inactive' : 'active';
    binder5.update();
  }
};

const binder5 = new TemplateBinder('#example5', state5);
binder5.bind();
