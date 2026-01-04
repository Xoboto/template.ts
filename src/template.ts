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
 * - Modular binder architecture - extensible with custom binders
 */

import { State, StateValue, RootElement } from './types';
import { IBinder, BinderContext } from './binder-interface';
import { ConditionalBinder, LoopBinder, TextBinder, AttributeBinder, PropertyBinder, EventBinder } from './binders';

export type { State, StateValue, RootElement } from './types';
export type { IBinder, BinderContext } from './binder-interface';

export class TemplateBinder {
  private container: RootElement | null;
  private state: State;
  private binders: IBinder[] = [];
  private originalTemplate: string = '';
  private stateProxy: State;
  private transitionClass?: string;
  private _autoUpdate: boolean = false;

  public get autoUpdate(): boolean {
    return this._autoUpdate;
  }

  public set autoUpdate(value: boolean) {
    this._autoUpdate = value;
  }

  constructor(selectorOrElement: string | RootElement, initialState: State = {}, transitionClass?: string) {
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

    // Mark this element as having a template binder
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.container as any).__TEMPLATE_BINDER = this;

    // Create a proxy to track state changes
    this.stateProxy = new Proxy(this.state, {
      set: (target, property, value): boolean => {
        target[property as string] = value;
        return true;
      }
    });

    // Register default binders
    this.registerDefaultBinders();
  }

  /**
   * Register default binders with their priorities
   */
  private registerDefaultBinders(): void {
    this.addBinder(new LoopBinder());        // Priority 10
    this.addBinder(new ConditionalBinder()); // Priority 20
    this.addBinder(new TextBinder());        // Priority 30
    this.addBinder(new AttributeBinder());   // Priority 40
    this.addBinder(new PropertyBinder());    // Priority 50
    this.addBinder(new EventBinder());       // Priority 60
  }

  /**
   * Add a custom binder to the collection
   */
  public addBinder(binder: IBinder): void {
    this.binders.push(binder);
    // Sort by priority (lower = earlier)
    this.binders.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Remove a binder by instance
   */
  public removeBinder(binder: IBinder): void {
    const index = this.binders.indexOf(binder);
    if (index > -1) {
      this.binders.splice(index, 1);
    }
  }

  /**
   * Get all registered binders
   */
  public getBinders(): IBinder[] {
    return [...this.binders];
  }

  /**
   * Get the ConditionalBinder instance
   */
  public getConditionalBinder(): ConditionalBinder | undefined {
    return this.binders.find(b => b instanceof ConditionalBinder) as ConditionalBinder | undefined;
  }

  /**
   * Bind the template to the state
   */
  public bind(): void {
    if (!this.container) return;

    // Clear previous bindings
    this.clearBindings();

    // Process all binders
    this.processTemplate();

    // Initial render
    this.render();
  }

  /**
   * Update the DOM with current state
   */
  public update(withAnimation: boolean = true): void {
    if (!this.container) return;
    
    const context = this.createContext();
    
    // Update all binders
    this.binders.forEach(binder => {
      binder.update(context, withAnimation);
    });
  }

  /**
   * Create binder context
   */
  private createContext(): BinderContext {
    return {
      state: this.state,
      autoUpdate: () => this.autoUpdate,
      transitionClass: this.transitionClass,
      updateCallback: () => this.update(),
      conditionalBinder: this.getConditionalBinder(),
      bindElement: (element: RootElement, contextState: State, loopItem?: any, loopIndex?: number) => 
        this.bindElement(element, contextState, loopItem, loopIndex)
    };
  }

  /**
   * Bind a specific element with given context state
   * Used for nested/sub-binding (e.g., loop items)
   */
  private bindElement(element: RootElement, contextState: State, loopItem?: any, loopIndex?: number): void {
    const context: BinderContext = {
      state: contextState,
      autoUpdate: () => this.autoUpdate,
      transitionClass: this.transitionClass,
      updateCallback: () => this.update(),
      conditionalBinder: this.getConditionalBinder(),
      bindElement: (el: RootElement, ctxState: State, item?: any, idx?: number) => this.bindElement(el, ctxState, item, idx),
      loopItem: loopItem,
      loopIndex: loopIndex,
      isStaticBinding: loopItem !== undefined // Mark as static if this is a loop item
    };

    // Use hierarchical walker for consistent processing
    this.walkElements(element, (el) => {
      return this.processElementWithBinders(el, context);
    });
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

    const context = this.createContext();
    
    // Walk DOM tree hierarchically and process each element with binders
    this.walkElements(this.container, (element) => {
      return this.processElementWithBinders(element, context);
    });
  }

  /**
   * Walk DOM elements hierarchically (top-to-bottom)
   */
  private walkElements(root: RootElement, callback: (element: Element) => void | 'skip-children'): void {
    const processElement = (element: Element): void => {
      // Check if this element is managed by another TemplateBinder
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((element as any).__TEMPLATE_BINDER && (element as any).__TEMPLATE_BINDER !== this) {
        return; // Skip sub-templates
      }

      // Process this element
      const result = callback(element);
      
      // Skip children if requested or if element is a sub-template root
      if (result === 'skip-children') {
        return;
      }

      // Process children
      const children = Array.from(element.children);
      for (const child of children) {
        processElement(child);
      }
    };

    // Start with root's children (or root itself if it's an Element)
    if (root instanceof Element) {
      processElement(root);
    } else {
      // ShadowRoot case
      const children = Array.from(root.children);
      for (const child of children) {
        processElement(child as Element);
      }
    }
  }

  /**
   * Process a single element with all binders in priority order
   */
  private processElementWithBinders(element: Element, context: BinderContext): void | 'skip-children' {
    for (const binder of this.binders) {
      if (binder.canHandle(element, context)) {
        const result = binder.processElement(element, context);
        if (result === 'skip-children') {
          return 'skip-children'; // Stop processing this element with other binders
        }
      }
    }
  }

  /**
   * Render the template
   */
  private render(): void {
    // Initial update with all binders
    this.update(false);
  }

  /**
   * Clear all bindings
   */
  private clearBindings(): void {
    const context = this.createContext();
    
    // Clear all binders
    this.binders.forEach(binder => {
      binder.clear(context);
    });
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
