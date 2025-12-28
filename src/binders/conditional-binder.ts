/**
 * Conditional Binder Module
 * Handles @if directive for conditional rendering
 */

import { IBinder, BinderContext } from '../binder-interface';
import { ConditionalBinding, RootElement } from '../types';
import { evaluateCondition } from '../expression-evaluator';

export class ConditionalBinder implements IBinder {
  readonly priority = 20;
  private bindings: ConditionalBinding[] = [];

  process(element: RootElement, context: BinderContext): void {
    const elements = Array.from(element.querySelectorAll('[\\@if]'));
    
    elements.forEach((el: Element) => {
      const condition = el.getAttribute('@if');
      if (condition) {
        const computedStyle = window.getComputedStyle(el);
        const originalDisplay = computedStyle.display !== 'none' ? computedStyle.display : '';
        
        const parent = el.parentNode;
        
        const placeholder = parent ? document.createComment(`@if:${condition}`) : null;
        if (parent && placeholder) {
          parent.insertBefore(placeholder, el);
        }

        if (context.isStaticBinding) {
          // For static bindings (loop items), evaluate immediately and don't store
          const shouldShow = evaluateCondition(condition, context.state);
          if (!shouldShow && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        } else {
          // For dynamic bindings, store for updates
          this.bindings.push({
            element: el,
            condition: condition,
            originalDisplay: originalDisplay || 'block',
            isVisible: true,
            parent: parent,
            placeholder: placeholder
          });
        }

        el.removeAttribute('@if');
      }
    });
  }

  update(context: BinderContext, withAnimation?: boolean): void {
    this.bindings.forEach(binding => {
      const shouldShow = evaluateCondition(binding.condition, context.state);
      
      if (shouldShow !== binding.isVisible) {
        binding.isVisible = shouldShow;
        
        if (shouldShow && binding.placeholder) {
          const parent = binding.placeholder.parentNode;
          if (parent) {
            parent.insertBefore(binding.element, binding.placeholder.nextSibling);
          }
        } else if (!shouldShow && binding.element.parentNode) {
          binding.element.parentNode.removeChild(binding.element);
        }
      }
    });
  }

  clear(context: BinderContext): void {
    this.bindings = [];
  }

  /**
   * Check if an element is hidden by any parent with @if
   */
  isElementHiddenByParent(element: Element): boolean {
    let parent = element.parentElement;
    while (parent) {
      const conditionalBinding = this.bindings.find(b => b.element === parent);
      if (conditionalBinding && !conditionalBinding.isVisible) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }
}
