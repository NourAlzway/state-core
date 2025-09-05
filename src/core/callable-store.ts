import { useSyncExternalStore } from 'react';
import {
  CallableStore,
  StoreInternal,
  ValidStateType,
  StrictEffectFn,
  SafeRecord,
  isFunction,
} from '../types';
import { createBoundEffect } from './effect-handler';

/**
 * Creates a callable store interface from an internal store implementation
 */
export function createCallableStore<T extends ValidStateType, Actions>(
  store: StoreInternal<T>
): CallableStore<T, Actions> {
  // Bind effects as well as actions
  const boundEffects: SafeRecord<string, (...args: unknown[]) => void> = {};
  Object.entries(store.effects).forEach(([name, effect]) => {
    if (isFunction(effect)) {
      boundEffects[name] = createBoundEffect(
        store,
        name,
        effect as StrictEffectFn<T>
      );
    }
  });

  // Create the combined state + actions + effects object
  const createFullState = (): Readonly<T> & Actions => {
    const state = store.getState();
    const combined = { ...state, ...store.actions, ...boundEffects };
    return combined as Readonly<T> & Actions;
  };

  // Create a callable store that can be used as a hook
  function callableStore(): Readonly<T> & Actions;
  function callableStore<R>(selector: (state: Readonly<T> & Actions) => R): R;
  function callableStore<R>(
    selector?: (state: Readonly<T> & Actions) => R
  ): R | (Readonly<T> & Actions) {
    // Try to use the hook for reactive subscriptions
    try {
      const state = useSyncExternalStore(
        store.subscribe,
        store.getState,
        store.getState
      );
      const stateWithActions = {
        ...state,
        ...store.actions,
        ...boundEffects,
      } as Readonly<T> & Actions;
      return selector ? selector(stateWithActions) : stateWithActions;
    } catch {
      // If hooks cannot be used (outside render or multiple Reacts), return a non-reactive snapshot
      const fullState = createFullState();
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          '[Store Warning] store() could not use React hooks (likely called outside render). Returning a non-reactive snapshot. Use store.use(selector) for imperative reads or call store() inside components.'
        );
      }
      return selector ? selector(fullState) : fullState;
    }
  }

  // Add store methods directly
  callableStore.subscribe = store.subscribe;

  // Add utility methods
  callableStore.use = <R>(selector: (state: Readonly<T> & Actions) => R): R => {
    if (!isFunction(selector)) {
      throw new TypeError('Selector must be a function');
    }
    const fullState = createFullState();
    return selector(fullState);
  };

  // Type-safe return using proper callable store interface
  return callableStore as CallableStore<T, Actions>;
}
