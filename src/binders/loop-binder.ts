/**
 * Loop Binder Module
 * Handles @for directive for rendering arrays
 */

import { IBinder, BinderContext } from '../binder-interface';
import { LoopBinding, RootElement } from '../types';
import { evaluateCode } from '../expression-evaluator';

export class LoopBinder implements IBinder {
  readonly priority = 10; // Must run first to generate elements
  private bindings: LoopBinding[] = [];

  process(element: RootElement, context: BinderContext): void {
    const allElements = Array.from(element.querySelectorAll('[\\@for]'));
    
    // Filter to only top-level loops (not nested inside another @for)
    const topLevelElements = allElements.filter(el => {
      let parent = el.parentElement;
      while (parent && parent !== element) {
        if (parent.hasAttribute('@for')) {
          return false;
        }
        parent = parent.parentElement;
      }
      return true;
    });
    
    topLevelElements.forEach(el => {
      const itemsKey = el.getAttribute('@for');
      if (itemsKey) {
        const templateElement = el.cloneNode(true) as Element;
        const parent = el.parentElement;
        
        if (parent) {
          const placeholder = document.createComment(`loop:${itemsKey}`);
          parent.insertBefore(placeholder, el);
          
          if (context.isStaticBinding) {
            // For static/nested loops, render immediately without storing
            const items = context.state[itemsKey];
            if (Array.isArray(items)) {
              items.forEach((item, index) => {
                const element = this.createLoopElement(
                  templateElement, 
                  item, 
                  index, 
                  items, 
                  context,
                  context.loopItem // Pass parent loop item to nested loops
                );
                if (element) {
                  parent.insertBefore(element, placeholder.nextSibling);
                }
              });
            }
          } else {
            // For dynamic loops, store for updates
            this.bindings.push({
              element: el,
              itemsKey: itemsKey,
              templateElement: templateElement,
              parentElement: parent,
              placeholder: placeholder,
              renderedElements: []
            });
          }

          el.remove();
        }
      }
    });
  }

  update(context: BinderContext, withAnimation?: boolean): void {
    this.bindings.forEach(binding => {
      this.updateSingleLoop(binding, context);
    });
  }

  clear(context: BinderContext): void {
    this.bindings.forEach(binding => {
      binding.renderedElements.forEach(el => el.remove());
    });
    this.bindings = [];
  }

  private updateSingleLoop(binding: LoopBinding, context: BinderContext): void {
    const items = context.state[binding.itemsKey];
    
    if (!Array.isArray(items)) {
      return;
    }

    // Clear existing rendered elements
    binding.renderedElements.forEach(el => el.remove());
    binding.renderedElements = [];

    // Render new elements
    items.forEach((item, index) => {
      const element = this.createLoopElement(
        binding.templateElement, 
        item, 
        index, 
        items, 
        context
      );
      if (element) {
        binding.parentElement.insertBefore(element, binding.placeholder.nextSibling);
        binding.renderedElements.push(element);
      }
    });
  }

  private createLoopElement(
    templateElement: Element, 
    item: any, 
    index: number, 
    items: any[], 
    context: BinderContext,
    parentItem?: any
  ): Element | null {
    const element = templateElement.cloneNode(true) as Element;
    element.removeAttribute('@for');

    // Create loop context - spread state first, then override with loop variables
    // This ensures loop-specific values take precedence
    const loopContext: Record<string, any> = {
      ...context.state,  // Include global state
      item: item,        // Current loop item (overrides any parent 'item')
      index: index,      // Current loop index
      items: items       // Current loop items array
    };
    
    // Add parent only if it exists (nested loops)
    if (parentItem !== undefined) {
      loopContext.parent = parentItem;
    }

    // Delegate binding of inner content to TemplateBinder
    // Mark as static so bindings aren't registered (loop items are re-rendered, not updated)
    if (context.bindElement) {
      context.bindElement(element, loopContext, item, index);
    }

    return element;
  }
}
