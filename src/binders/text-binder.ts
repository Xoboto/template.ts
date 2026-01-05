/**
 * Text Binder Module
 * Handles {{ expression }} text interpolation
 */

import { IBinder, BinderContext } from '../binder-interface';
import { BindingInfo } from '../types';
import { evaluateExpression } from '../expression-evaluator';

export class TextBinder implements IBinder {
  readonly priority = 30;
  private bindings: BindingInfo[] = [];

  canHandle(element: Element): boolean {
    // Only check direct child text nodes, not descendants
    // This prevents processing text inside loop/conditional templates before they're processed
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.includes('{{')) {
        return true;
      }
    }
    return false;
  }

  processElement(element: Element, context: BinderContext): void | 'skip-children' {
    // Only process direct child text nodes
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.includes('{{')) {
        const text = node.textContent;
        const matches = text.match(/\{\{([^}]+)\}\}/g);
        
        if (matches) {
          if (context.isStaticBinding) {
            // For static bindings (loop items), evaluate immediately
            try {
              const evaluatedText = evaluateExpression(text, context.state);
              node.textContent = evaluatedText;
            } catch (e) {
              console.debug('Error evaluating static text binding:', e);
            }
          } else {
            // For dynamic bindings, store for updates
            this.bindings.push({
              element: element,
              property: 'textContent',
              expression: text
            });
          }
        }
      }
    }
  }

  process(): void {
    // Legacy method - not used with new hierarchical walker
  }

  update(context: BinderContext, withAnimation?: boolean): void {
    this.bindings.forEach(binding => {
      // Skip if parent is hidden by @if
      if (context.conditionalBinder && context.conditionalBinder.isElementHiddenByParent(binding.element)) {
        return;
      }

      try {
        const text = evaluateExpression(binding.expression, context.state);
        if (binding.element.textContent !== text) {
          binding.element.textContent = text;
          if (withAnimation && context.transitionClass) {
            this.applyTransition(binding.element, context.transitionClass);
          }
        }
      } catch (e) {
        console.debug('Skipping text binding evaluation:', e);
      }
    });
  }

  clear(): void {
    this.bindings = [];
  }

  private applyTransition(element: Element, transitionClass: string): void {
    element.classList.add(transitionClass);
    
    const removeTransition = (): void => {
      element.classList.remove(transitionClass);
      element.removeEventListener('animationend', removeTransition);
      element.removeEventListener('transitionend', removeTransition);
    };
    
    element.addEventListener('animationend', removeTransition);
    element.addEventListener('transitionend', removeTransition);
    
    setTimeout(removeTransition, 600);
  }
}
