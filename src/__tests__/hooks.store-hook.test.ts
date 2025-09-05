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

describe('hooks - createStoreHook', () => {
  beforeEach(() => {
    mockUseSyncExternalStore.mockClear();
  });

  describe('basic functionality', () => {
    it('should create a React hook function', () => {
      // Arrange
      const initialState = { count: 0 };
      const store = createStoreInternal(initialState);

      // Act
      const useStoreHook = createStoreHook(store);

      // Assert
      expect(typeof useStoreHook).toBe('function');
      expect(useStoreHook.name).toBe('useStoreHook');
    });

    it('should return state and actions when hook is called', () => {
      // Arrange
      const initialState = { count: 0 };
      const store = createStoreInternal(initialState);
      const incrementAction = createAction(
        store,
        'increment',
        (state: typeof initialState) => ({
          count: state.count + 1,
        })
      );
      store.actions.increment = incrementAction;

      // Act
      mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
        return getSnapshot();
      });

      const useStoreHook = createStoreHook<
        typeof initialState,
        { increment: () => void }
      >(store);
      const result = useStoreHook();

      // Assert
      expect(result).toHaveProperty('count', 0);
      expect(result).toHaveProperty('increment');
      expect(typeof result.increment).toBe('function');
    });

    it("should use React's useSyncExternalStore internally", () => {
      // Arrange
      const initialState = { count: 0 };
      const store = createStoreInternal(initialState);
      mockUseSyncExternalStore.mockReturnValue(initialState);

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
  });
});
