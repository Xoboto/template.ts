import { TemplateBinder } from '../src/template.js';

interface BasicState {
  title: string;
  description: string;
  author: string;
  time: string;
}

// Example 1: Basic Data Binding with Transition Effects
const state1: BasicState = {
  title: 'Welcome to TemplateBinder',
  description: 'A lightweight TypeScript template engine with reactive data binding. Watch elements highlight when values update!',
  author: 'Your Name',
  time: 'Just now'
};

const binder1 = new TemplateBinder('#example1', state1, "updatedTransition");
binder1.bind();

// Update example after 3 seconds to show transition effect
setTimeout(() => {
  state1.title = 'Updated Title!';
  state1.description = 'This content was updated dynamically. Notice the highlight effect!';
  state1.author = 'Updated Author';
  binder1.update();
}, 3000);

// Update time every second to show live transitions
setInterval(() => {
  state1.time = new Date().toLocaleTimeString();
  binder1.update();
}, 1000);
