# Template.Ts

A powerful, lightweight TypeScript template engine with reactive data binding, conditional rendering, loops, and event handling.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)

## Overview

Template.Ts is a simple yet powerful template engine that allows you to create dynamic HTML templates with TypeScript. It provides an intuitive syntax for data binding, loops, conditionals, and event handling without the complexity of larger frameworks.

### Features

✨ **Simple Syntax** - Easy-to-learn template directives
- `{{ expression }}` - Text interpolation
- `@for="array"` - Loop through arrays
- `@if="condition"` - Conditional rendering
- `@att:name="value"` - Dynamic attribute binding
- `@on:event="handler"` - Event handling

🚀 **Lightweight** - Zero dependencies, minimal footprint

⚡ **Efficient Updates** - Only changed parts of the DOM are updated

🔒 **Type Safe** - Full TypeScript support with proper typing

🎯 **Framework Agnostic** - Works with any project setup

## 🚀 Live Examples

Try it out right now: **[https://xoboto.github.io/template.ts/](https://xoboto.github.io/template.ts/)**

## Installation

### Using npm

```bash
npm install template.ts
```

### Using yarn

```bash
yarn add template.ts
```

### Using CDN

```html
<script type="module">
  import { TemplateBinder } from 'https://unpkg.com/xoboto.ts/dist/template.js';
</script>
```

## Quick Start

### 1. Create your HTML template

```html
<div id="app">
  <h1>{{ title }}</h1>
  <p>{{ description }}</p>
  <button @on:click="handleClick">Click Me</button>
</div>
```

### 2. Bind data with TypeScript

```typescript
import { TemplateBinder } from 'template.ts';

const state = {
  title: 'Hello World',
  description: 'Welcome to Template.Ts',
  handleClick: function() {
    alert('Button clicked!');
  }
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

### 3. Update the view

```typescript
// Update state
state.title = 'Updated Title';
state.description = 'Content has changed';

// Refresh the view
binder.update();
```

## Usage Guide

### Text Interpolation

Use double curly braces `{{ }}` to display data:

```html
<div id="app">
  <h1>{{ title }}</h1>
  <p>User: {{ username }}</p>
  <p>Score: {{ score }}</p>
</div>
```

```typescript
const state = {
  title: 'Dashboard',
  username: 'John Doe',
  score: 100
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

### Loops with @for

Iterate through arrays with the `@for` directive:

```html
<ul>
  <li @for="items">
    {{ item.name }} - ${{ item.price }}
  </li>
</ul>
```

```typescript
const state = {
  items: [
    { name: 'Apple', price: 1.99 },
    { name: 'Banana', price: 0.99 },
    { name: 'Orange', price: 2.49 }
  ]
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

Inside loops, you have access to:
- `item` - Current item in the array
- `index` - Current index (0-based)
- `items` - The entire array

### Conditional Rendering with @if

Show or hide elements based on conditions:

```html
<div id="app">
  <p @if="isLoggedIn">Welcome back, {{ username }}!</p>
  <p @if="!isLoggedIn">Please log in.</p>
  
  <ul @if="items.length > 0">
    <li @for="items">{{ item.name }}</li>
  </ul>
  <p @if="items.length === 0">No items available.</p>
</div>
```

```typescript
const state = {
  isLoggedIn: true,
  username: 'Alice',
  items: []
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

### Dynamic Attributes with @att:

Bind any HTML attribute dynamically:

```html
<div id="app">
  <input @att:type="inputType" @att:placeholder="placeholderText" />
  <button @att:disabled="isDisabled">Submit</button>
  <div @att:class="containerClass">Content</div>
  <img @att:src="imageUrl" @att:alt="imageAlt" />
</div>
```

```typescript
const state = {
  inputType: 'email',
  placeholderText: 'Enter your email',
  isDisabled: false,
  containerClass: 'container active',
  imageUrl: '/images/logo.png',
  imageAlt: 'Company Logo'
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

### Event Handling with @on:

Attach event listeners to elements:

```html
<div id="app">
  <button @on:click="handleClick">Click Me</button>
  <input @on:input="handleInput" @on:focus="handleFocus" />
  <form @on:submit="handleSubmit">
    <button type="submit">Submit</button>
  </form>
</div>
```

```typescript
const state = {
  handleClick: function() {
    console.log('Button clicked!');
  },
  handleInput: function(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    console.log('Input:', value);
  },
  handleFocus: function() {
    console.log('Input focused');
  },
  handleSubmit: function(e: Event) {
    e.preventDefault();
    console.log('Form submitted');
  }
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

### Event Handlers in Loops

Event handlers in loops receive the item and index as parameters:

```html
<ul>
  <li @for="todos">
    <input type="checkbox" @on:change="toggleTodo" />
    <span>{{ item.text }}</span>
    <button @on:click="deleteTodo">Delete</button>
  </li>
</ul>
```

```typescript
interface Todo {
  text: string;
  completed: boolean;
}

const state = {
  todos: [
    { text: 'Learn Template.Ts', completed: false },
    { text: 'Build an app', completed: false }
  ],
  toggleTodo: function(e: Event, item: Todo, index: number) {
    this.todos[index].completed = !this.todos[index].completed;
    binder.update();
  },
  deleteTodo: function(e: Event, item: Todo, index: number) {
    this.todos.splice(index, 1);
    binder.update();
  }
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

### Function Calls in Templates

Call functions within your templates:

```html
<div id="app">
  <p>Total: {{ calculateTotal() }}</p>
  <ul>
    <li @for="items" @att:class="getItemClass(index)">
      {{ item.name }}
    </li>
  </ul>
</div>
```

```typescript
const state = {
  items: [
    { name: 'Item 1', price: 10 },
    { name: 'Item 2', price: 20 }
  ],
  calculateTotal: function() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  },
  getItemClass: function(index: number) {
    return index % 2 === 0 ? 'even' : 'odd';
  }
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

## Complete Example: Todo List

```html
<!DOCTYPE html>
<html>
<head>
  <title>Todo List</title>
</head>
<body>
  <div id="app">
    <h1>{{ title }}</h1>
    
    <input 
      @att:value="newTodo" 
      @on:input="updateNewTodo" 
      @att:placeholder="'Add a new todo...'" 
    />
    <button @on:click="addTodo">Add</button>
    
    <ul @if="todos.length > 0">
      <li @for="todos" @att:class="item.completed ? 'completed' : ''">
        <input 
          type="checkbox" 
          @att:checked="item.completed" 
          @on:change="toggleTodo" 
        />
        <span>{{ item.text }}</span>
        <button @on:click="deleteTodo">Delete</button>
      </li>
    </ul>
    
    <p @if="todos.length === 0">No todos yet!</p>
    <p @if="todos.length > 0">
      Total: {{ todos.length }} | Completed: {{ completedCount() }}
    </p>
  </div>
  
  <script type="module" src="./app.js"></script>
</body>
</html>
```

```typescript
// app.ts
import { TemplateBinder } from 'template.ts';

interface Todo {
  text: string;
  completed: boolean;
}

interface TodoState {
  title: string;
  todos: Todo[];
  newTodo: string;
  addTodo: () => void;
  updateNewTodo: (e: Event) => void;
  toggleTodo: (e: Event, item: Todo, index: number) => void;
  deleteTodo: (e: Event, item: Todo, index: number) => void;
  completedCount: () => number;
}

const state: TodoState = {
  title: 'My Todo List',
  todos: [],
  newTodo: '',
  
  addTodo: function() {
    if (this.newTodo.trim()) {
      this.todos.push({
        text: this.newTodo,
        completed: false
      });
      this.newTodo = '';
      binder.update();
    }
  },
  
  updateNewTodo: function(e: Event) {
    this.newTodo = (e.target as HTMLInputElement).value;
  },
  
  toggleTodo: function(e: Event, item: Todo, index: number) {
    this.todos[index].completed = !this.todos[index].completed;
    binder.update();
  },
  
  deleteTodo: function(e: Event, item: Todo, index: number) {
    this.todos.splice(index, 1);
    binder.update();
  },
  
  completedCount: function() {
    return this.todos.filter(t => t.completed).length;
  }
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

## API Reference

### TemplateBinder

#### Constructor

```typescript
new TemplateBinder(selector: string, initialState: State)
```

- `selector`: CSS selector for the container element
- `initialState`: Object containing your state and methods

#### Methods

##### `bind()`
Processes the template and performs initial rendering.

```typescript
binder.bind();
```

##### `update()`
Updates the DOM with the current state. Call this after modifying state values.

```typescript
state.title = 'New Title';
binder.update();
```

##### `setState(key, value)`
Updates a single state value.

```typescript
binder.setState('title', 'New Title');
```

##### `getState()`
Returns the state proxy object.

```typescript
const state = binder.getState();
```

##### `destroy()`
Cleans up bindings and restores original HTML.

```typescript
binder.destroy();
```

## Template Directives

| Directive | Description | Example |
|-----------|-------------|---------|
| `{{ expression }}` | Text interpolation | `{{ username }}` |
| `@for="arrayName"` | Loop through array | `<li @for="items">{{ item.name }}</li>` |
| `@if="condition"` | Conditional rendering | `<p @if="isVisible">Hello</p>` |
| `@att:name="value"` | Dynamic attribute | `<div @att:class="className"></div>` |
| `@on:event="handler"` | Event listener | `<button @on:click="handleClick">Click</button>` |

## TypeScript Support

Full TypeScript support with proper typing:

```typescript
import { TemplateBinder } from 'template.ts';

interface AppState {
  count: number;
  increment: () => void;
}

const state: AppState = {
  count: 0,
  increment: function(this: AppState) {
    this.count++;
    binder.update();
  }
};

const binder = new TemplateBinder('#app', state);
binder.bind();
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern browsers with ES2020+ support

## Examples

### 🌐 Live Examples
**Try it online:** [https://xoboto.github.io/template.ts/](https://xoboto.github.io/template.ts/)

### 💻 Run Examples Locally
Check out the `/examples` folder for more complete examples:

```bash
npm run example
```

This will start a local server and open the examples in your browser.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Xoboto Contributors

## Links

- [GitHub Repository](https://github.com/xoboto/template.ts)
- [Issues](https://github.com/xoboto/template.ts/issues)
- [NPM Package](https://www.npmjs.com/package/template.ts)

---

Made with ❤️ using TypeScript
