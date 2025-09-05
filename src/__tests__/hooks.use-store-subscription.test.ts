/**
 * @jest-environment node
 */

const mockUseSyncExternalStore = jest.fn();

jest.mock('react', () => ({
  useSyncExternalStore: mockUseSyncExternalStore,
}));

import { useStore } from '../hooks/use-store';
import { createStoreInternal } from '../core/store-internal';

describe('hooks - useStore subscription behavior', () => {
  beforeEach(() => {
    mockUseSyncExternalStore.mockClear();
  });

  it('should pass correct subscribe function to useSyncExternalStore', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    mockUseSyncExternalStore.mockReturnValue(initialState);

    // Act
    useStore(store);

    // Assert
    expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
      store.subscribe,
      expect.any(Function),
      expect.any(Function)
    );

    const [subscribeFn] = mockUseSyncExternalStore.mock.calls[0];
    expect(subscribeFn).toBe(store.subscribe);
  });

  it('should create proper snapshot functions', () => {
    // Arrange
    const initialState = { count: 42 };
    const store = createStoreInternal(initialState);
    mockUseSyncExternalStore.mockImplementation(
      (subscribe, getSnapshot, getServerSnapshot) => {
        expect(getSnapshot()).toEqual(initialState);
        expect(getServerSnapshot()).toEqual(initialState);
        return getSnapshot();
      }
    );

    // Act
    const result = useStore(store);

    // Assert
    expect(result).toEqual(initialState);
  });

  it('should create snapshot functions with selector applied', () => {
    // Arrange
    const initialState = { count: 42, name: 'test' };
    const store = createStoreInternal(initialState);
    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    // Act
    const count = useStore(store, state => state.count);

    // Assert
    expect(count).toBe(42);

    const [, getSnapshotFn] = mockUseSyncExternalStore.mock.calls[0];
    expect(getSnapshotFn()).toBe(42);
  });
});
