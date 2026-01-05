/**
 * Type definitions for TemplateBinder
 */

export type StateValue = any;
export type State = Record<string, StateValue>;
export type RootElement = Element | ShadowRoot;

export interface BindingInfo {
  element: Element;
  property: string;
  expression: string;
}

export interface EventBinding {
  element: Element;
  event: string;
  handler: string;
}

export interface ConditionalBinding {
  element: Element;
  condition: string;
  originalDisplay: string;
  isVisible: boolean;
  parent: ParentNode | null;
  placeholder: Comment | null;
}

export interface LoopBinding {
  element: Element;
  itemsKey: string;
  templateElement: Element;
  parentElement: Element;
  placeholder: Comment;
  renderedElements: Element[];
}
