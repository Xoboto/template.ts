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

  canHandle(element: Element, context: BinderContext): boolean {
    return element.hasAttribute('@for');
  }

  processElement(element: Element, context: BinderContext): void | 'skip-children' {
    const itemsKey = element.getAttribute('@for');
    if (!itemsKey) return;

    // Clone AFTER removing @for so the template doesn't have it
    element.removeAttribute('@for');
    const templateElement = element.cloneNode(true) as Element;
    
    const parent = element.parentElement;
    if (!parent) return;

    const placeholder = document.createComment(`loop:${itemsKey}`);
    parent.insertBefore(placeholder, element);
    
    if (context.isStaticBinding) {
      // For static/nested loops, render immediately without storing
      const items = context.state[itemsKey];
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          const loopElement = this.createLoopElement(
            templateElement, 
            item, 
            index, 
            items, 
            context,
            context.loopItem
          );
          if (loopElement) {
            parent.insertBefore(loopElement, placeholder.nextSibling);
          }
        });
      }
    } else {
      // For dynamic loops, store for updates
      const binding: LoopBinding = {
        element: element,
        itemsKey: itemsKey,
        templateElement: templateElement,
        parentElement: parent,
        placeholder: placeholder,
        renderedElements: []
      };
      this.bindings.push(binding);
      
      // Initial render
      const items = context.state[itemsKey];
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          const loopElement = this.createLoopElement(
            templateElement, 
            item, 
            index, 
            items, 
            context
          );
          if (loopElement) {
            parent.insertBefore(loopElement, placeholder.nextSibling);
            binding.renderedElements.push(loopElement);
          }
        });
      }
    }

    // Remove the original template element from DOM
    element.remove();
    
    // Skip children since we've cloned the template and will process it separately
    return 'skip-children';
  }

  process(element: RootElement, context: BinderContext): void {
    // Legacy method - not used with new hierarchical walker
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
