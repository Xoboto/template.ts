import { TemplateBinder } from '../src/template.js';

interface Todo {
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  newTodo: string;
  updateNewTodo: (e: Event) => void;
  addTodo: () => void;
  toggleTodo: (e: Event, item: Todo, index: number) => void;
  deleteTodo: (e: Event, item: Todo, index: number) => void;
  completedCount: () => number;
}

// Example 4: Todo List
const state4: TodoState = {
  todos: [
    { text: 'Learn TemplateBinder', completed: false },
    { text: 'Build awesome apps', completed: false },
    { text: 'Share with the world', completed: false }
  ],
  newTodo: '',
  updateNewTodo: function(e: Event): void {
    this.newTodo = (e.target as HTMLInputElement).value;
  },
  addTodo: function(): void {
    if (this.newTodo.trim()) {
      this.todos.push({
        text: this.newTodo,
        completed: false
      });
      this.newTodo = '';
      binder4.update();
    }
  },
  toggleTodo: function(e: Event, item: Todo, index: number): void {
    this.todos[index].completed = !this.todos[index].completed;
    binder4.update();
  },
  deleteTodo: function(e: Event, item: Todo, index: number): void {
    this.todos.splice(index, 1);
    binder4.update();
  },
  completedCount: function(): number {
    return this.todos.filter(t => t.completed).length;
  }
};

const binder4 = new TemplateBinder('#example4', state4);
binder4.bind();
