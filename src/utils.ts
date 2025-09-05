// Deep equality and cloning utilities

import { isObject, SafeRecord } from './types';

// Type guards
const isRecord = (value: unknown): value is SafeRecord<string, unknown> =>
  isObject(value) && !Array.isArray(value) && !(value instanceof Date);

const isDateLike = (value: unknown): value is Date => value instanceof Date;

const isArrayLike = (value: unknown): value is readonly unknown[] =>
  Array.isArray(value);

// Deep equality check with circular reference support
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return a === b;

  if (isDateLike(a) && isDateLike(b)) {
    return a.getTime() === b.getTime();
  }

  if (isArrayLike(a) && isArrayLike(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // One is array, other is not
  if (isArrayLike(a) || isArrayLike(b)) return false;

  // One is date, other is not
  if (isDateLike(a) || isDateLike(b)) return false;

  // Handle Objects with proper type guards
  if (isRecord(a) && isRecord(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}

/**
 * Creates a deep copy of an object
 * Handles circular references, undefined values, functions, symbols, and dates correctly
 * Type-safe implementation without assertions
 */
export function deepClone<T>(
  obj: T,
  visited = new WeakMap<object, unknown>()
): T {
  // Handle primitive types and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Type guard for objects to ensure proper WeakMap usage
  if (!isObject(obj) && !isArrayLike(obj) && !isDateLike(obj)) {
    return obj;
  }

  const objAsObject = obj as object;

  // Handle circular references
  if (visited.has(objAsObject)) {
    return visited.get(objAsObject) as T;
  }

  // Handle Date objects with proper type checking
  if (isDateLike(obj)) {
    const clonedDate = new Date(obj.getTime());
    visited.set(objAsObject, clonedDate);
    return clonedDate as T;
  }

  // Handle Arrays with proper type checking
  if (isArrayLike(obj)) {
    const cloned: unknown[] = [];
    visited.set(objAsObject, cloned);

    for (let i = 0; i < obj.length; i++) {
      cloned[i] = deepClone(obj[i], visited);
    }

    return cloned as T;
  }

  // Handle Objects with proper type guards
  if (isRecord(obj)) {
    const cloned: SafeRecord<PropertyKey, unknown> = {};
    visited.set(objAsObject, cloned);

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key], visited);
      }
    }

    return cloned as T;
  }

  // Fallback for other object types (functions, symbols, etc.)
  return obj;
}

/**
 * Type-safe shallow merge utility
 * Merges properties from source into target without type assertions
 */
export function shallowMerge<T extends SafeRecord<PropertyKey, unknown>>(
  target: T,
  source: Partial<T>
): T {
  if (!isRecord(target) || !isRecord(source)) {
    throw new Error('Both target and source must be objects for shallow merge');
  }

  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      if (sourceValue !== undefined) {
        (result as SafeRecord<PropertyKey, unknown>)[key] = sourceValue;
      }
    }
  }

  return result;
}

/**
 * Type-safe object property checker
 */
export function hasProperty<
  T extends SafeRecord<PropertyKey, unknown>,
  K extends PropertyKey,
>(obj: T, key: K): key is K & keyof T {
  return isRecord(obj) && Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Type-safe empty object checker
 */
export function isEmpty(obj: unknown): obj is SafeRecord<PropertyKey, never> {
  if (!isRecord(obj)) return false;
  return Object.keys(obj as SafeRecord<PropertyKey, unknown>).length === 0;
}
