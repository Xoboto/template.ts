# TemplateBinder Examples

This folder contains comprehensive TypeScript examples demonstrating all features of the TemplateBinder library.

## Running the Examples

1. First, build the main project:
   ```bash
   npm run build
   ```

2. Build the examples:
   ```bash
   cd examples
   npx tsc
   ```

3. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. Navigate to `http://localhost:8000/examples/`

## Examples Included

### Example 1: Basic Data Binding (`basic.ts`)
- Simple text interpolation using `{{ }}`
- Demonstrates dynamic content updates
- TypeScript interfaces for type safety

### Example 2: Counter with Events (`counter.ts`)
- Event handling with `@on:click`
- Multiple button actions
- State updates and re-rendering
- Proper TypeScript typing

### Example 3: List Rendering (`list.ts`)
- Loop through arrays with `@for`
- Dynamic styling with `@att:class`
- Conditional rendering with `@if`
- Add/remove items dynamically
- Typed item interfaces

### Example 4: Todo List Application (`todo.ts`)
- Complete todo list implementation
- Input binding
- Checkbox state management
- Add, toggle, and delete operations
- Computed properties
- Strong typing for todo items

### Example 5: Dynamic Attributes & Conditionals (`dynamic.ts`)
- Dynamic attribute binding
- Conditional content based on state
- CSS class toggling
- Union types for status

### Example 6: User Cards with Complex Data (`users.ts`)
- Complex data structures
- Multiple conditionals
- Event handlers with parameters
- Confirm dialogs and prompts
- Typed user interfaces

## Key Features Demonstrated

✅ **Text Interpolation**: `{{ expression }}`
✅ **Loops**: `@for="arrayName"`
✅ **Conditionals**: `@if="condition"`
✅ **Dynamic Attributes**: `@att:attributeName="expression"`
✅ **Event Handling**: `@on:eventName="handler"`
✅ **Nested Data**: Access to `item`, `index`, `items` in loops
✅ **Function Calls**: Execute functions in templates
✅ **Efficient Updates**: Only changed parts are updated
✅ **TypeScript**: Full type safety and IntelliSense support

## Code Structure

Each example includes:
- TypeScript file with interfaces and typed state
- Event handlers with proper type annotations
- Template in `index.html` with directives
- Shared styles for presentation

## TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better IDE autocomplete
- **Refactoring**: Easier to maintain and refactor
- **Documentation**: Types serve as inline documentation
- **Interface Contracts**: Clear data structure definitions

## File Structure

```
examples/
├── index.html          # Main HTML with all examples
├── basic.ts           # Example 1: Basic binding
├── counter.ts         # Example 2: Counter
├── list.ts            # Example 3: List rendering
├── todo.ts            # Example 4: Todo list
├── dynamic.ts         # Example 5: Dynamic attributes
├── users.ts           # Example 6: User cards
├── tsconfig.json      # TypeScript configuration
├── README.md          # This file
└── dist/              # Compiled JavaScript (generated)
    ├── basic.js
    ├── counter.js
    ├── list.js
    ├── todo.js
    ├── dynamic.js
    └── users.js
```
