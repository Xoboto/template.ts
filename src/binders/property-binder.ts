/**
 * Event Binder Module
 * Handles @on:eventName directive for event listeners
 */

import { evaluateCode } from '../expression-evaluator';
import { IBinder, BinderContext } from '../binder-interface';
import { BindingInfo, RootElement } from '../types';

/**
 * Convert kebab-case to camelCase
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export class PropertyBinder implements IBinder {
  readonly priority = 50;
  private bindings: BindingInfo[] = [];

  process(element: RootElement, context: BinderContext): void {
    const elements = element.querySelectorAll('*');
    
    const allElements = element instanceof Element 
      ? [element, ...Array.from(elements)] 
      : Array.from(elements);
    
    allElements.forEach(el => {
      // Skip elements managed by another TemplateBinder
      if (context.isElementInSubTemplate && context.isElementInSubTemplate(el)) {
        return;
      }
      
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('@prop:')) {
          const propertyName = kebabToCamel(attr.name.replace('@prop:', ''));
          const expression = attr.value;
          
        if (context.isStaticBinding) {
          // For static bindings (loop items), evaluate immediately and don't store
          try {
            const value = evaluateCode(expression, context.state);
            (el as any)[propertyName] = value;
          } catch (e) {
            console.debug('Error evaluating static attribute binding:', e);
          }
        } else {
          // For dynamic bindings, store for updates
          this.bindings.push({
            element: el,
            property: `property:${propertyName}`,
            expression: expression
          });
        }

          el.removeAttribute(attr.name);
        }
      });
    });
  }

  update(context: BinderContext, withAnimation?: boolean): void {
    // Update regular attributes
    this.bindings
      .filter(b => b.property.startsWith('property:'))
      .forEach(binding => {
        // Skip if parent is hidden by @if
        if (context.conditionalBinder && context.conditionalBinder.isElementHiddenByParent(binding.element)) {
          return;
        }

        try {
          const propertyName = binding.property.replace('property:', '');
          const value = evaluateCode(binding.expression, context.state);
          
          if ((binding.element as any)[propertyName] !== value) {
            (binding.element as any)[propertyName] = value;
            if (withAnimation && context.transitionClass) {
              this.applyTransition(binding.element, context.transitionClass);
            }
          }
        } catch (e) {
          console.debug('Skipping attribute binding evaluation:', e);
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
