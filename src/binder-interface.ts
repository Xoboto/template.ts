/**
 * Binder Interface
 * Base interface for all binding modules
 */

import { RootElement, State } from './types';

export interface IBinder {
  /**
   * Priority/weight for execution order (lower = earlier)
   * Recommended values:
   * - 10: Loops (@for) - must run first to generate elements
   * - 20: Conditionals (@if) - run before attributes/events
   * - 30: Text bindings ({{ }})
   * - 40: Attribute bindings (@att:, @batt:)
   * - 50: Event bindings (@on:)
   */
  readonly priority: number;

  /**
   * Process the template and extract bindings
   */
  process(element: RootElement, context: BinderContext): void;

  /**
   * Update bindings with current state
   */
  update(context: BinderContext, withAnimation?: boolean): void;

  /**
   * Clear all bindings and cleanup
   */
  clear(context: BinderContext): void;
}

/**
 * Context passed to binders
 */
export interface BinderContext {
  state: State;
  autoUpdate: () => boolean;
  transitionClass?: string;
  updateCallback: () => void;
  conditionalBinder?: any; // Reference to ConditionalBinder for visibility checks
  bindElement?: (element: RootElement, contextState: State, loopItem?: any, loopIndex?: number) => void; // Callback to bind sub-elements
  isElementInSubTemplate?: (element: Element) => boolean; // Check if element is managed by another TemplateBinder
  loopItem?: any; // Current loop item (for event handlers)
  loopIndex?: number; // Current loop index (for event handlers)
  isStaticBinding?: boolean; // If true, don't register bindings for updates (used in loops)
}
