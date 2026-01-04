/**
 * Attribute Binder Module
 * Handles @att:attributeName and @batt:attributeName directives
 */

import { IBinder, BinderContext } from '../binder-interface';
import { BindingInfo, RootElement } from '../types';
import { evaluateCode } from '../expression-evaluator';

export class AttributeBinder implements IBinder {
  readonly priority = 40;
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
        const isBoolean = attr.name.startsWith('@batt:');
        if (isBoolean || attr.name.startsWith('@att:')) {
          const attrName = attr.name.replace(isBoolean ? '@batt:' : '@att:', '');
          const expression = attr.value;
          
          if (context.isStaticBinding) {
            // For static bindings (loop items), evaluate immediately and don't store
            try {
              const value = evaluateCode(expression, context.state);
              if (isBoolean) {
                if (value) {
                  el.setAttribute(attrName, '');
                }
              } else {
                el.setAttribute(attrName, value);
              }
            } catch (e) {
              console.debug('Error evaluating static attribute binding:', e);
            }
          } else {
            // For dynamic bindings, store for updates
            this.bindings.push({
              element: el,
              property: isBoolean ? `bool-attribute:${attrName}` : `attribute:${attrName}`,
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
      .filter(b => b.property.startsWith('attribute:'))
      .forEach(binding => {
        // Skip if parent is hidden by @if
        if (context.conditionalBinder && context.conditionalBinder.isElementHiddenByParent(binding.element)) {
          return;
        }

        try {
          const attrName = binding.property.replace('attribute:', '');
          const value = evaluateCode(binding.expression, context.state);
          
          if (binding.element.getAttribute(attrName) !== value) {
            binding.element.setAttribute(attrName, value);
            if (withAnimation && context.transitionClass) {
              this.applyTransition(binding.element, context.transitionClass);
            }
          }
        } catch (e) {
          console.debug('Skipping attribute binding evaluation:', e);
        }
      });

    // Update boolean attributes
    this.bindings
      .filter(b => b.property.startsWith('bool-attribute:'))
      .forEach(binding => {
        // Skip if parent is hidden by @if
        if (context.conditionalBinder && context.conditionalBinder.isElementHiddenByParent(binding.element)) {
          return;
        }

        try {
          const attrName = binding.property.replace('bool-attribute:', '');
          const value = evaluateCode(binding.expression, context.state);
          const hasAttr = binding.element.hasAttribute(attrName);
          if (value && !hasAttr) {
            binding.element.setAttribute(attrName, '');
            if (withAnimation && context.transitionClass) {
              this.applyTransition(binding.element, context.transitionClass);
            }
          } else if (!value && hasAttr) {
            binding.element.removeAttribute(attrName);
            if (withAnimation && context.transitionClass) {
              this.applyTransition(binding.element, context.transitionClass);
            }
          }
        } catch (e) {
          console.debug('Skipping boolean attribute binding evaluation:', e);
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
