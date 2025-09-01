import { StoreBuilder, StoreConfig, ValidStateType } from './types';
import { StoreBuilderImpl } from './core/store-builder';

/**
 * Creates a new store with a fluent configuration API
 *
 * This library uses a callable store pattern that simplifies state management:
 * - Access state and actions through destructuring: `const { count, increment } = store()`
 * - Direct method calls like `store.increment()` are not available by design
 * - Built-in support for async operations and error handling
 *
 * @param initialState The starting state for the store
 * @param config Optional settings for error handling and debugging
 * @returns A store builder that allows chaining of actions and effects
 *
 * @example
 * ```typescript
 * const counterStore = createStore({ count: 0 })
 *   .action('increment', (state, amount: number = 1) => ({
 *     count: state.count + amount
 *   }))
 *   .action('decrement', (state) => ({
 *     count: state.count - 1
 *   }))
 *   .build();
 *
 * // Usage in React components with destructuring
 * const { count, increment, decrement } = counterStore();
 * ```
 *
 * **Key behaviors**:
 * - State updates merge properties at the top level only
 * - Use asyncAction to get automatic loading and error state management
 * - All errors are handled gracefully with optional custom error handlers
 */
export function createStore<T extends ValidStateType>(
  initialState: T,
  config?: StoreConfig
): StoreBuilder<T> {
  return new StoreBuilderImpl(initialState, config);
}
