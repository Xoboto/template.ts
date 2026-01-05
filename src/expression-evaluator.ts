/**
 * Expression Evaluator Module
 * Handles evaluation of JavaScript expressions and conditions with given context
 */

import { State } from './types';

/**
 * Evaluate JavaScript code with a given context
 */
export function evaluateCode(code: string, context: any): any {
  try {
    // Check if code is a simple function call (e.g., "functionName()" or "functionName(arg1, arg2)")
    const functionCallMatch = code.match(/^(\w+)\s*\((.*)\)$/);
    
    if (functionCallMatch) {
      const functionName = functionCallMatch[1];
      const argsString = functionCallMatch[2].trim();
      
      // Check if the function exists in the context
      if (typeof context[functionName] === 'function') {
        // Evaluate arguments if any
        let args: any[] = [];
        if (argsString) {
          // Create a function to evaluate the arguments
          const keys = Object.keys(context);
          const values = keys.map(key => context[key]);
          // eslint-disable-next-line no-new-func
          const argFunc = new Function(...keys, `return [${argsString}]`);
          args = argFunc(...values);
        }
        
        // Call the function with proper this context
        return context[functionName].apply(context, args);
      }
    }
    
    // Check if code is a simple property access (e.g., "functionName" without parentheses)
    if (/^\w+$/.test(code) && typeof context[code] === 'function') {
      // Return the function result by calling it
      return context[code].call(context);
    }
    
    // For complex expressions, use Function constructor
    const keys = Object.keys(context);
    const values = keys.map(key => context[key]);
    
    // eslint-disable-next-line no-new-func
    const func = new Function(...keys, `return ${code}`);
    return func(...values);
  } catch (e) {
    console.error('Error evaluating code:', code, e);
    return '';
  }
}

/**
 * Evaluate an expression with the current state
 */
export function evaluateExpression(expression: string, state: State): string {
  let result = expression;
  
  // Replace {{ expression }} with evaluated value
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
    const trimmedExpr = expr.trim();
    return evaluateCode(trimmedExpr, state);
  });

  return result;
}

/**
 * Evaluate an expression with a specific context
 */
export function evaluateExpressionWithContext(expression: string, context: any): string {
  let result = expression;
  
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, expr) => {
    const trimmedExpr = expr.trim();
    return evaluateCode(trimmedExpr, context);
  });

  return result;
}

/**
 * Evaluate a condition
 */
export function evaluateCondition(condition: string, state: State): boolean {
  try {
    return !!evaluateCode(condition, state);
  } catch (e) {
    console.error('Error evaluating condition:', condition, e);
    return false;
  }
}

/**
 * Evaluate a condition with a specific context
 */
export function evaluateConditionWithContext(condition: string, context: any): boolean {
  try {
    return !!evaluateCode(condition, context);
  } catch (e) {
    console.error('Error evaluating condition:', condition, e);
    return false;
  }
}
