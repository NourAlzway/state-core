import { useSyncExternalStore } from 'react';
import { StoreInternal, ValidStateType } from '../types';

/**
 * Creates a React hook from a store for easy component integration
 */
export function createStoreHook<T extends ValidStateType, Actions>(
  store: StoreInternal<T>
): () => T & Actions {
  return function useStoreHook(): T & Actions {
    const state = useSyncExternalStore(
      store.subscribe,
      store.getState,
      store.getState
    );

    return { ...state, ...store.actions } as T & Actions;
  };
}
