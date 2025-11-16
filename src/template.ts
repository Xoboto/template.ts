/**
 * TemplateBinder - A lightweight TypeScript template engine
 * 
 * Features:
 * - Simple HTML templating with double curly braces {{ }}
 * - Looping through arrays with @for directive
 * - Dynamic attribute binding with @att:attributeName
 * - Event handling with @on:eventName directive
 * - Conditional rendering with @if directive
 * - Support for nested templates and components
 * - Efficient DOM updates - only changed parts are refreshed
 */

type StateValue = any;
type State = Record<string, StateValue>;

interface BindingInfo {
  element: Element;
  property: string;
  expression: string;
}

interface EventBinding {
  element: Element;
  event: string;
  handler: string;
}

interface ConditionalBinding {
  element: Element;
  condition: string;
  originalDisplay: string;
  isVisible: boolean;
}

interface LoopBinding {
  element: Element;
  itemsKey: string;
  template: string;
  parentElement: Element;
  placeholder: Comment;
  renderedElements: Element[];
}

export class TemplateBinder {
  private container: Element | null;
  private state: State;
  private bindings: BindingInfo[] = [];
  private eventBindings: EventBinding[] = [];
  private conditionalBindings: ConditionalBinding[] = [];
  private loopBindings: LoopBinding[] = [];
  private originalTemplate: string = '';
  private stateProxy: State;
  private transitionClass?: string;
  public autoUpdate: boolean = false;

  constructor(selectorOrElement: string | Element, initialState: State = {}, transitionClass?: string) {
    if (transitionClass) {
      this.transitionClass = transitionClass;
    }
    
    // Handle both string selector and Element
    if (typeof selectorOrElement === 'string') {
      this.container = document.querySelector(selectorOrElement);
      if (!this.container) {
        throw new Error(`Container element not found: ${selectorOrElement}`);
      }
    } else {
      this.container = selectorOrElement;
    }

    this.state = initialState;
    this.originalTemplate = this.container.innerHTML;

    // Create a proxy to track state changes
    this.stateProxy = new Proxy(this.state, {
      set: (target, property, value): boolean => {
        target[property as string] = value;
        return true;
      }
    });
  }

  /**
   * Bind the template to the state
   */
  public bind(): void {
    if (!this.container) return;

    // Clear previous bindings
    this.clearBindings();

    // Process the template
    this.processTemplate();

    // Initial render
    this.render();
  }

  /**
   * Update the DOM with current state
   */
  public update(withAnimation: boolean = true): void {
    this.updateTextBindings(withAnimation);
    this.updateConditionals();
    this.updateLoops();
    this.updateAttributes(withAnimation);
  }

  /**
   * Get the state proxy for reactive updates
   */
  public getState(): State {
    return this.stateProxy;
  }

  /**
   * Set a state value
   */
  public setState(key: string, value: StateValue): void {
    this.state[key] = value;
  }

  /**
   * Process the template and extract bindings
   */
  private processTemplate(): void {
    if (!this.container) return;

    // Process loops first (they generate elements)
    this.processLoops(this.container);

    // Process conditionals
    this.processConditionals(this.container);

    // Process text bindings
    this.processTextBindings(this.container);

    // Process attribute bindings
    this.processAttributeBindings(this.container);

    // Process event bindings
    this.processEventBindings(this.container);
  }

  /**
   * Process text bindings {{ expression }}
   */
  private processTextBindings(element: Element): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Node[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes('{{')) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      const text = node.textContent || '';
      const matches = text.match(/\{\{([^}]+)\}\}/g);
      
      if (matches && node.parentElement) {
        matches.forEach(() => {
          this.bindings.push({
            element: node.parentElement!,
            property: 'textContent',
            expression: text
          });
        });
      }
    });
  }

  /**
   * Process attribute bindings @att:attributeName="expression"
   */
  private processAttributeBindings(element: Element): void {
    // Get all elements in the container
    const elements = element.querySelectorAll('*');
    
    // Also check the root element itself
    const allElements = [element, ...Array.from(elements)];
    
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const isBoolean = attr.name.startsWith('@batt:');
        if (isBoolean || attr.name.startsWith('@att:')) {
          const attrName = attr.name.replace(isBoolean ? '@batt:' : '@att:', '');
          const expression = attr.value;
          
          this.bindings.push({
            element: el,
            property: isBoolean ? `bool-attribute:${attrName}` : `attribute:${attrName}`,
            expression: expression
          });

          // Remove the directive attribute
          el.removeAttribute(attr.name);
        }
      });
    });
  }

  /**
   * Process event bindings @on:eventName="handler"
   */
  private processEventBindings(element: Element): void {
    // Get all elements in the container
    const elements = element.querySelectorAll('*');
    
    // Also check the root element itself
    const allElements = [element, ...Array.from(elements)];
    
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('@on:')) {
          const eventName = attr.name.replace('@on:', '');
          const handlerName = attr.value;
          
          this.eventBindings.push({
            element: el,
            event: eventName,
            handler: handlerName
          });

          // Attach the event listener
          const handler = this.state[handlerName];
          if (typeof handler === 'function') {
            el.addEventListener(eventName, (ev) => {
              const result = handler.call(this.state, ev);
              
              // Auto-update if enabled
              if (this.autoUpdate) {
                // If handler returns a Promise, wait for it
                if (result && typeof result.then === 'function') {
                  result.then(() => this.update());
                } else {
                  this.update();
                }
              }
              
              return result;
            });
          }

          // Remove the directive attribute
          el.removeAttribute(attr.name);
        }
      });
    });
  }

  /**
   * Process conditional rendering @if="condition"
   */
  private processConditionals(element: Element): void {
    const elements = Array.from(element.querySelectorAll('[\\@if]'));
    
    elements.forEach(el => {
      const condition = el.getAttribute('@if');
      if (condition) {
        const computedStyle = window.getComputedStyle(el);
        const originalDisplay = computedStyle.display !== 'none' ? computedStyle.display : '';

        this.conditionalBindings.push({
          element: el,
          condition: condition,
          originalDisplay: originalDisplay || 'block',
          isVisible: true
        });

        el.removeAttribute('@if');
      }
    });
  }

  /**
   * Process loops @for="itemsKey"
   */
  private processLoops(element: Element): void {
    const elements = Array.from(element.querySelectorAll('[\\@for]'));
    
    elements.forEach(el => {
      const itemsKey = el.getAttribute('@for');
      if (itemsKey) {
        const template = el.outerHTML;
        const parent = el.parentElement;
        
        if (parent) {
          // Create a placeholder comment
          const placeholder = document.createComment(`loop:${itemsKey}`);
          parent.insertBefore(placeholder, el);
          
          this.loopBindings.push({
            element: el,
            itemsKey: itemsKey,
            template: template,
            parentElement: parent,
            placeholder: placeholder,
            renderedElements: []
          });

          // Remove the original element
          el.remove();
        }
      }
    });
  }

  /**
   * Render the template
   */
  private render(): void {
    this.updateTextBindings();
    this.updateConditionals();
    this.updateLoops();
    this.updateAttributes();
  }

  /**
   * Update text bindings
   */
  private updateTextBindings(withAnimation: boolean = false): void {
    this.bindings.forEach(binding => {
      if (binding.property === 'textContent') {
        const text = this.evaluateExpression(binding.expression);
        if (binding.element.textContent !== text) {
          binding.element.textContent = text;
          if (withAnimation) {
            this.applyTransition(binding.element);
          }
        }
      }
    });
  }

  /**
   * Update attribute bindings
   */
  private updateAttributes(withAnimation: boolean = false): void {
    this.bindings.forEach(binding => {
      if (binding.property.startsWith('attribute:')) {
        const attrName = binding.property.replace('attribute:', '');
        const value = this.evaluateCode(binding.expression, this.state);
        
        if (binding.element.getAttribute(attrName) !== value) {
          binding.element.setAttribute(attrName, value);
          if (withAnimation) {
            this.applyTransition(binding.element);
          }
        }
      } else if (binding.property.startsWith('bool-attribute:')) {
        const attrName = binding.property.replace('bool-attribute:', '');
        const value = this.evaluateCode(binding.expression, this.state);
        const hasAttr = binding.element.hasAttribute(attrName);
        if (value && !hasAttr) {
          binding.element.setAttribute(attrName, '');
          if (withAnimation) {
            this.applyTransition(binding.element);
          }
        } else if (!value && hasAttr) {
          binding.element.removeAttribute(attrName);
          if (withAnimation) {
            this.applyTransition(binding.element);
          }
        }
      }
    });
  }

  /**
   * Update conditional bindings
   */
  private updateConditionals(): void {
    this.conditionalBindings.forEach(binding => {
      const shouldShow = this.evaluateCondition(binding.condition);
      
      if (shouldShow !== binding.isVisible) {
        binding.isVisible = shouldShow;
        (binding.element as HTMLElement).style.display = shouldShow 
          ? binding.originalDisplay 
          : 'none';
      }
    });
  }

  /**
   * Update loop bindings
   */
  private updateLoops(): void {
    this.loopBindings.forEach(binding => {
      const items = this.state[binding.itemsKey];
      
      if (!Array.isArray(items)) {
        return;
      }

      // Clear existing rendered elements
      binding.renderedElements.forEach(el => el.remove());
      binding.renderedElements = [];

      // Render new elements
      items.forEach((item, index) => {
        const element = this.createLoopElement(binding.template, item, index, items);
        if (element) {
          binding.parentElement.insertBefore(element, binding.placeholder.nextSibling);
          binding.renderedElements.push(element);
        }
      });
    });
  }

  /**
   * Create an element for a loop iteration
   */
  private createLoopElement(template: string, item: any, index: number, items: any[]): Element | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(template, 'text/html');
    const element = doc.body.firstElementChild;

    if (!element) return null;

    // Remove @for attribute
    element.removeAttribute('@for');

    // Create a context for this iteration
    const context = {
      item: item,
      index: index,
      items: items,
      ...this.state
    };

    // Process text content
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Node[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes('{{')) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(node => {
      const text = node.textContent || '';
      const evaluated = this.evaluateExpressionWithContext(text, context);
      node.textContent = evaluated;
    });

    // Process attributes for ALL elements (root + nested)
    const allElements = [element, ...Array.from(element.querySelectorAll('*'))];
    
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('@att:')) {
          const attrName = attr.name.replace('@att:', '');
          const value = this.evaluateCode(attr.value, context);
          el.setAttribute(attrName, value);
          el.removeAttribute(attr.name);
        } else if (attr.name.startsWith('@batt:')) {
          const attrName = attr.name.replace('@batt:', '');
          const value = this.evaluateCode(attr.value, context);
          if (value) {
            el.setAttribute(attrName, '');
          } else {
            el.removeAttribute(attrName);
          }
          el.removeAttribute(attr.name);
        } else if (attr.name.startsWith('@on:')) {
          const eventName = attr.name.replace('@on:', '');
          const handlerName = attr.value;
          const handler = this.state[handlerName];
          
          if (typeof handler === 'function') {
            el.addEventListener(eventName, (ev) => {
              const result = handler.call(this.state, ev, item, index);
              
              // Auto-update if enabled
              if (this.autoUpdate) {
                // If handler returns a Promise, wait for it
                if (result && typeof result.then === 'function') {
                  result.then(() => this.update());
                } else {
                  this.update();
                }
              }
              
              return result;
            });
          }
          el.removeAttribute(attr.name);
        }
      });
    });

    // Process conditionals within loop
    const conditionalElements = Array.from(element.querySelectorAll('[\\@if]'));
    conditionalElements.forEach(el => {
      const condition = el.getAttribute('@if');
      if (condition) {
        const shouldShow = this.evaluateConditionWithContext(condition, context);
        (el as HTMLElement).style.display = shouldShow ? '' : 'none';
        el.removeAttribute('@if');
      }
    });

    return element;
  }

  /**
   * Evaluate an expression with the current state
   */
  private evaluateExpression(expression: string): string {
    let result = expression;
    
    // Replace {{ expression }} with evaluated value
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
      const trimmedExpr = expr.trim();
      return this.evaluateCode(trimmedExpr, this.state);
    });

    return result;
  }

  /**
   * Evaluate an expression with a specific context
   */
  private evaluateExpressionWithContext(expression: string, context: any): string {
    let result = expression;
    
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
      const trimmedExpr = expr.trim();
      return this.evaluateCode(trimmedExpr, context);
    });

    return result;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: string): boolean {
    try {
      return !!this.evaluateCode(condition, this.state);
    } catch (e) {
      console.error('Error evaluating condition:', condition, e);
      return false;
    }
  }

  /**
   * Evaluate a condition with a specific context
   */
  private evaluateConditionWithContext(condition: string, context: any): boolean {
    try {
      return !!this.evaluateCode(condition, context);
    } catch (e) {
      console.error('Error evaluating condition:', condition, e);
      return false;
    }
  }

  /**
   * Evaluate JavaScript code with a given context
   */
  private evaluateCode(code: string, context: any): any {
    try {
      // Check if code is a simple function call (e.g., "functionName()" or "functionName(arg1, arg2)")
      const functionCallMatch = code.match(/^(\w+)\s*\((.*)\)$/);
      
      if (functionCallMatch) {
        const functionName = functionCallMatch[1];
        const argsString = functionCallMatch[2].trim();
        
        // Check if the function exists in the context
        if (typeof context[functionName] === 'function') {
          // Evaluate arguments if any
          let args: any[] = [];
          if (argsString) {
            // Create a function to evaluate the arguments
            const keys = Object.keys(context);
            const values = keys.map(key => context[key]);
            // eslint-disable-next-line no-new-func
            const argFunc = new Function(...keys, `return [${argsString}]`);
            args = argFunc(...values);
          }
          
          // Call the function with proper this context
          return context[functionName].apply(context, args);
        }
      }
      
      // Check if code is a simple property access (e.g., "functionName" without parentheses)
      if (/^\w+$/.test(code) && typeof context[code] === 'function') {
        // Return the function result by calling it
        return context[code].call(context);
      }
      
      // For complex expressions, use Function constructor
      const keys = Object.keys(context);
      const values = keys.map(key => context[key]);
      
      // eslint-disable-next-line no-new-func
      const func = new Function(...keys, `return ${code}`);
      return func(...values);
    } catch (e) {
      console.error('Error evaluating code:', code, e);
      return '';
    }
  }

  /**
   * Clear all bindings
   */
  private clearBindings(): void {
    // Remove event listeners
    this.eventBindings.forEach(binding => {
      const handler = this.state[binding.handler];
      if (typeof handler === 'function') {
        binding.element.removeEventListener(binding.event, handler);
      }
    });

    // Clear loop rendered elements
    this.loopBindings.forEach(binding => {
      binding.renderedElements.forEach(el => el.remove());
    });

    this.bindings = [];
    this.eventBindings = [];
    this.conditionalBindings = [];
    this.loopBindings = [];
  }

  /**
   * Apply transition effect to an element when its value updates
   */
  private applyTransition(element: Element): void {
    if (!this.transitionClass) return;
    element.classList.add(this.transitionClass);
    
    // Remove the class after animation completes
    const removeTransition = (): void => {
      element.classList.remove(this.transitionClass!);
      element.removeEventListener('animationend', removeTransition);
      element.removeEventListener('transitionend', removeTransition);
    };
    
    // Listen for both animation and transition end events
    element.addEventListener('animationend', removeTransition);
    element.addEventListener('transitionend', removeTransition);
    
    // Fallback: remove after 600ms if no events fire
    setTimeout(removeTransition, 600);
  }

  /**
   * Destroy the binder and clean up
   */
  public destroy(): void {
    this.clearBindings();
    if (this.container) {
      this.container.innerHTML = this.originalTemplate;
    }
  }
}

export default TemplateBinder;
