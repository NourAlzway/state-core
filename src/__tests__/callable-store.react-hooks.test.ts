/**
 * @jest-environment node
 */

const mockUseSyncExternalStore = jest.fn((_subscribe, getSnapshot) => {
  return getSnapshot();
});

jest.mock('react', () => ({
  useSyncExternalStore: mockUseSyncExternalStore,
}));

import { createCallableStore } from '../core/callable-store';
import { createStoreInternal } from '../core/store-internal';

describe('callable-store - React hooks integration', () => {
  it('should handle hook failures gracefully in non-React environments', () => {
    // Arrange
    mockUseSyncExternalStore.mockImplementation(() => {
      throw new Error('Hooks can only be called inside function components');
    });

    // Act
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    const state = callableStore();

    // Assert
    expect(state).toEqual(initialState);
    if (process.env.NODE_ENV !== 'production') {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[Store Warning] store() could not use React hooks'
        )
      );
    }

    consoleSpy.mockRestore();

    mockUseSyncExternalStore.mockImplementation(
      (_subscribe: any, getSnapshot: any) => getSnapshot()
    );
  });

  it('should work with selectors in hook failure mode', () => {
    // Arrange
    mockUseSyncExternalStore.mockImplementation(() => {
      throw new Error('Hooks can only be called inside function components');
    });

    // Act
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const initialState = { count: 42, name: 'test' };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    const count = callableStore(state => state.count);
    const name = callableStore(state => state.name);

    // Assert
    expect(count).toBe(42);
    expect(name).toBe('test');

    consoleSpy.mockRestore();
    mockUseSyncExternalStore.mockImplementation(
      (_subscribe: any, getSnapshot: any) => getSnapshot()
    );
  });
});
