import { useSyncExternalStore } from 'react';
import {
  CallableStore,
  StoreInternal,
  ValidStateType,
  StrictEffectFn,
  SafeRecord,
  isFunction,
  StateSelector,
  ActionSelector,
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

  // Create the combined actions + effects object
  const createActions = (): Actions => {
    const combined = Object.assign({}, store.actions, boundEffects);
    return combined as Actions;
  };

  // Create a callable store with new get/use pattern
  const callableStore = {
    // Get method for accessing state with React hooks integration
    get: <R>(stateSelector: StateSelector<T, R>): R => {
      if (!isFunction(stateSelector)) {
        throw new TypeError('State selector must be a function');
      }

      // Try to use React hooks for reactive subscriptions
      try {
        const state = useSyncExternalStore(
          store.subscribe,
          store.getState,
          store.getState
        );
        return stateSelector(state);
      } catch {
        // If hooks cannot be used (outside render), return a non-reactive snapshot
        const state = store.getState();
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(
            '[Store Warning] store.get() could not use React hooks (likely called outside render). Returning a non-reactive snapshot.'
          );
        }
        return stateSelector(state);
      }
    },

    // Use method for accessing actions
    use: <R>(actionSelector: ActionSelector<Actions, R>): R => {
      if (!isFunction(actionSelector)) {
        throw new TypeError('Action selector must be a function');
      }
      const actions = createActions();
      return actionSelector(actions);
    },

    // Keep subscription for direct subscriptions
    subscribe: store.subscribe,
    getState: store.getState,

    // Add remaining StoreInternal properties for compatibility
    actions: store.actions,
    effects: store.effects,
    config: store.config,
  };

  return callableStore as CallableStore<T, Actions>;
}
