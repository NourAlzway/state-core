import { StoreInternal, StoreConfig, ValidStateType, Listener } from '../types';
import { deepEqual } from '../utils';

/**
 * Creates the internal store implementation that manages state and subscriptions
 */
export function createStoreInternal<T extends ValidStateType>(
  initialState: T,
  config: StoreConfig = {}
): StoreInternal<T> {
  let state = initialState;
  const listeners = new Set<Listener<T>>();

  const getState = (): T => {
    return state;
  };

  const setState = (newState: Partial<T> | T): void => {
    function performStateUpdate(): void {
      const prevState = state;
      const nextState =
        typeof newState === 'object' && newState !== null
          ? { ...state, ...newState }
          : newState;

      const finalState = nextState;

      // Deep equality check for object states
      const statesEqual = deepEqual(finalState, state);

      if (!statesEqual) {
        state = finalState;

        // Notify listeners
        listeners.forEach(listener => {
          try {
            listener(state, prevState);
          } catch (error) {
            const finalError =
              error instanceof Error ? error : new Error(String(error));

            // Use configurable error handler
            if (config.errorHandler) {
              config.errorHandler(finalError, 'Listener');
            } else {
              // eslint-disable-next-line no-console
              console.error('Store: Listener error:', finalError);
            }
          }
        });
      }
    }
    performStateUpdate();
  };

  const subscribe = (listener: Listener<T>): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const store: StoreInternal<T> = {
    getState,
    setState,
    subscribe,
    actions: {},
    effects: {},
    config,
  };

  return store;
}
