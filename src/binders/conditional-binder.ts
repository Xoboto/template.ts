/**
 * Conditional Binder Module
 * Handles @if directive for conditional rendering
 */

import { IBinder, BinderContext } from '../binder-interface';
import { ConditionalBinding } from '../types';
import { evaluateCondition } from '../expression-evaluator';

export class ConditionalBinder implements IBinder {
  readonly priority = 20;
  private bindings: ConditionalBinding[] = [];

  canHandle(element: Element): boolean {
    return element.hasAttribute('@if');
  }

  processElement(element: Element, context: BinderContext): void | 'skip-children' {
    const condition = element.getAttribute('@if');
    if (!condition) return;

    const computedStyle = window.getComputedStyle(element);
    const originalDisplay = computedStyle.display !== 'none' ? computedStyle.display : '';
    
    const parent = element.parentNode;
    const placeholder = parent ? document.createComment(`@if:${condition}`) : null;
    
    if (parent && placeholder) {
      parent.insertBefore(placeholder, element);
    }

    if (context.isStaticBinding) {
      // For static bindings (loop items), evaluate once
      const shouldShow = evaluateCondition(condition, context.state);
      if (!shouldShow && element.parentNode) {
        element.parentNode.removeChild(element);
        return 'skip-children';
      }
    } else {
      // For dynamic bindings, store for updates
      this.bindings.push({
        element: element,
        condition: condition,
        originalDisplay: originalDisplay || 'block',
        isVisible: true,
        parent: parent,
        placeholder: placeholder
      });
    }

    element.removeAttribute('@if');
  }

  process(): void {
    // Legacy method - not used with new hierarchical walker
  }

  update(context: BinderContext): void {
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

  clear(): void {
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
