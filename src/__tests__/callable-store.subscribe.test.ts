/**
 * @jest-environment node
 */

import { createCallableStore } from '../core/callable-store';
import { createStoreInternal } from '../core/store-internal';

jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => {
    return getSnapshot();
  }),
}));

describe('callable-store - subscribe method', () => {
  it('should expose subscribe method from internal store', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    // Act
    const listener = jest.fn();
    const unsubscribe = callableStore.subscribe(listener);

    // Assert
    expect(typeof unsubscribe).toBe('function');
    expect(callableStore.subscribe).toBe(store.subscribe);
  });

  it('should notify subscribers when state changes', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    // Act
    const listener = jest.fn();

    callableStore.subscribe(listener);
    store.setState({ count: 1 });

    // Assert
    expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });
});
