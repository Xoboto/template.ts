/**
 * Event Binder Module
 * Handles @on:eventName directive for event listeners
 */

import { IBinder, BinderContext } from '../binder-interface';
import { EventBinding, RootElement } from '../types';

export class EventBinder implements IBinder {
  readonly priority = 60;
  private bindings: EventBinding[] = [];

  canHandle(element: Element, context: BinderContext): boolean {
    return Array.from(element.attributes).some(attr => 
      attr.name.startsWith('@on:')
    );
  }

  processElement(element: Element, context: BinderContext): void | 'skip-children' {
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('@on:')) {
        const eventName = attr.name.replace('@on:', '');
        const handlerName = attr.value;
        
        this.bindings.push({
          element: element,
          event: eventName,
          handler: handlerName
        });

        // Attach the event listener
        const handler = context.state[handlerName];
        if (typeof handler === 'function') {
          element.addEventListener(eventName, (ev) => {
            // Pass loop item and index if available
            const result = context.loopItem !== undefined 
              ? handler.call(context.state, ev, context.loopItem, context.loopIndex)
              : handler.call(context.state, ev);
            
            if (context.autoUpdate()) {
              if (result && typeof result.then === 'function') {
                result.then(() => context.updateCallback());
              } else {
                context.updateCallback();
              }
            }
            
            return result;
          });
        }

        element.removeAttribute(attr.name);
      }
    });
  }

  process(element: RootElement, context: BinderContext): void {
    // Legacy method - not used with new hierarchical walker
  }

  update(context: BinderContext, withAnimation?: boolean): void {
    // Events don't need updating after initial processing
  }

  clear(context: BinderContext): void {
    this.bindings.forEach(binding => {
      const handler = context.state[binding.handler];
      if (typeof handler === 'function') {
        binding.element.removeEventListener(binding.event, handler);
      }
    });
    this.bindings = [];
  }
}
