/**
 * Text Binder Module
 * Handles {{ expression }} text interpolation
 */

import { IBinder, BinderContext } from '../binder-interface';
import { BindingInfo, RootElement } from '../types';
import { evaluateExpression } from '../expression-evaluator';

export class TextBinder implements IBinder {
  readonly priority = 30;
  private bindings: BindingInfo[] = [];

  process(element: RootElement, context: BinderContext): void {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

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
        if (context.isStaticBinding) {
          // For static bindings (loop items), evaluate immediately and don't store
          try {
            const evaluatedText = evaluateExpression(text, context.state);
            node.parentElement.textContent = evaluatedText;
          } catch (e) {
            console.debug('Error evaluating static text binding:', e);
          }
        } else {
          // For dynamic bindings, store for updates
          matches.forEach(() => {
            this.bindings.push({
              element: node.parentElement!,
              property: 'textContent',
              expression: text
            });
          });
        }
      }
    });
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

  clear(context: BinderContext): void {
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
