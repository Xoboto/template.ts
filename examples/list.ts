import { TemplateBinder } from '../src/template.js';

interface Item {
  name: string;
  price: number;
}

interface ListState {
  items: Item[];
  styleName: (index: number) => string;
  removeItem: (e: Event, item: Item, index: number) => void;
  addItem: () => void;
}

// Example 3: List Rendering with @for (with auto-update)
const state3: ListState = {
  items: [
    { name: 'Apple', price: 1.99 },
    { name: 'Banana', price: 0.99 },
    { name: 'Orange', price: 2.49 }
  ],
  styleName: function(index: number): string {
    return index % 2 === 0 ? 'even' : 'odd';
  },
  removeItem: function(e: Event, item: Item, index: number): void {
    this.items.splice(index, 1);
    // No need to call binder3.update() - it's automatic!
  },
  addItem: function(): void {
    const fruits = ['Mango', 'Pineapple', 'Grapes', 'Watermelon', 'Strawberry'];
    const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
    const randomPrice = parseFloat((Math.random() * 5 + 1).toFixed(2));
    
    this.items.push({
      name: randomFruit,
      price: randomPrice
    });
    // No need to call binder3.update() - it's automatic!
  }
};

const binder3 = new TemplateBinder('#example3', state3);
binder3.autoUpdate = true; // Enable auto-update as a property
binder3.bind();
