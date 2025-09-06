import { useSyncExternalStore } from 'react';
import {
  StoreInternal,
  Selector,
  ValidStateType,
  CallableStore,
} from '../types';

/**
 * React hook for subscribing to store state changes with optional data selection
 * Works with both StoreInternal and CallableStore (new get/use pattern)
 */
export function useStore<
  T extends ValidStateType,
  Actions = any,
  R = T & Actions,
>(
  store: StoreInternal<T> | CallableStore<T, Actions>,
  selector?: Selector<T & Actions, R>
): R {
  const getSnapshot = (): R => {
    const state = store.getState();
    // For CallableStore, we need to also include actions
    if ('actions' in store && 'effects' in store) {
      const fullState = Object.assign({}, state, store.actions);
      return selector
        ? selector(fullState as T & Actions)
        : (fullState as unknown as R);
    }
    return selector ? selector(state as T & Actions) : (state as unknown as R);
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
