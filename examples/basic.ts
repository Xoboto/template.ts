import { TemplateBinder } from '../src/template.js';

interface BasicState {
  title: string;
  description: string;
  author: string;
  time: string;
}

// Example 1: Basic Data Binding
const state1: BasicState = {
  title: 'Welcome to TemplateBinder',
  description: 'A lightweight TypeScript template engine with reactive data binding.',
  author: 'Your Name',
  time: 'Just now'
};

const binder1 = new TemplateBinder('#example1', state1);
binder1.bind();

// Update example after 3 seconds
setTimeout(() => {
  state1.title = 'Updated Title!';
  state1.description = 'This content was updated dynamically.';
  binder1.update();
}, 3000);

setInterval(() => {
  state1.time = new Date().toLocaleTimeString();
  binder1.update();
}, 500);
