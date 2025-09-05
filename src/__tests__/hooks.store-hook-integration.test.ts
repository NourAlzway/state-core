/**
 * @jest-environment node
 */

const mockUseSyncExternalStore = jest.fn();

jest.mock('react', () => ({
  useSyncExternalStore: mockUseSyncExternalStore,
}));

import { createStoreHook } from '../core/store-hook';
import { createStoreInternal } from '../core/store-internal';
import { createAction } from '../core/action-handler';

describe('hooks - createStoreHook integration', () => {
  beforeEach(() => {
    mockUseSyncExternalStore.mockClear();
  });

  it('should combine state and actions correctly', () => {
    // Arrange
    const initialState = { count: 0, name: 'initial' };
    const store = createStoreInternal(initialState);

    // Act
    store.actions.increment = createAction(
      store,
      'increment',
      (state: typeof initialState) => ({
        count: state.count + 1,
      })
    );

    store.actions.setName = createAction(
      store,
      'setName',
      (state: typeof initialState, ...args: any[]) => ({
        name: args[0] as string,
      })
    );

    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    const useStoreHook = createStoreHook<
      typeof initialState,
      {
        increment: () => void;
        setName: (name: string) => void;
      }
    >(store);
    const result = useStoreHook();

    // Assert
    expect(result.count).toBe(0);
    expect(result.name).toBe('initial');
    expect(typeof result.increment).toBe('function');
    expect(typeof result.setName).toBe('function');
  });

  it('should reflect state changes when actions are executed', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    // Act
    store.actions.increment = createAction(
      store,
      'increment',
      (state: typeof initialState) => ({
        count: state.count + 1,
      })
    );

    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    const useStoreHook = createStoreHook<
      typeof initialState,
      { increment: () => void }
    >(store);
    const result1 = useStoreHook();

    result1.increment();

    const result2 = useStoreHook();

    // Assert
    expect(result1.count).toBe(0);
    expect(result2.count).toBe(1);
  });

  it('should pass store subscribe and getState to useSyncExternalStore', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    mockUseSyncExternalStore.mockReturnValue({
      ...initialState,
      ...store.actions,
    });

    // Act
    const useStoreHook = createStoreHook(store);
    useStoreHook();

    // Assert
    expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
      store.subscribe,
      store.getState,
      store.getState
    );
  });

  it('should handle subscription updates correctly', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);

    // Act
    const mockSubscribe = jest.fn((): (() => void) => {
      return (): void => {};
    });
    store.subscribe = mockSubscribe;

    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    const useStoreHook = createStoreHook(store);
    useStoreHook();

    // Assert
    expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
      mockSubscribe,
      store.getState,
      store.getState
    );
  });
});
