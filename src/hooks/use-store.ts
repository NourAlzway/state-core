import { useSyncExternalStore } from 'react';
import { StoreInternal, Selector } from '../types';

/**
 * React hook for subscribing to store state changes with optional data selection
 */
export function useStore<T, R = T>(
  store: StoreInternal<T>,
  selector?: Selector<T, R>
): R {
  const getSnapshot = (): R => {
    const state = store.getState();
    return selector ? selector(state) : (state as unknown as R);
  };

  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}
