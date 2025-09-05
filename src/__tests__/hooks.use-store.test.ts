/**
 * @jest-environment node
 */

const mockUseSyncExternalStore = jest.fn();

jest.mock('react', () => ({
  useSyncExternalStore: mockUseSyncExternalStore,
}));

import { useStore } from '../hooks/use-store';
import { createStoreInternal } from '../core/store-internal';

describe('hooks - useStore', () => {
  beforeEach(() => {
    mockUseSyncExternalStore.mockClear();
  });

  describe('basic functionality', () => {
    it("should use React's useSyncExternalStore", () => {
      // Arrange
      const initialState = { count: 0, name: 'test' };
      const store = createStoreInternal(initialState);
      mockUseSyncExternalStore.mockReturnValue(initialState);

      // Act
      const result = useStore(store);

      // Assert
      expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
        store.subscribe,
        expect.any(Function),
        expect.any(Function)
      );
      expect(result).toEqual(initialState);
    });

    it('should return full state when no selector provided', () => {
      // Arrange
      const initialState = { count: 42, name: 'test', active: true };
      const store = createStoreInternal(initialState);
      mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
        return getSnapshot();
      });

      // Act
      const result = useStore(store);

      // Assert
      expect(result).toEqual(initialState);
    });

    it('should apply selector when provided', () => {
      // Arrange
      const initialState = { count: 42, name: 'test', active: true };
      const store = createStoreInternal(initialState);
      mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
        return getSnapshot();
      });

      // Act
      const count = useStore(store, state => state.count);
      const name = useStore(store, state => state.name);

      // Assert
      expect(count).toBe(42);
      expect(name).toBe('test');
    });

    it('should handle complex selectors', () => {
      // Arrange
      const initialState = {
        users: [
          { id: 1, name: 'John', active: true },
          { id: 2, name: 'Jane', active: false },
          { id: 3, name: 'Bob', active: true },
        ],
        filter: 'all' as 'all' | 'active' | 'inactive',
      };
      const store = createStoreInternal(initialState);
      mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
        return getSnapshot();
      });

      // Act
      const activeUsers = useStore(store, state =>
        state.users.filter(user => user.active)
      );
      const userCount = useStore(store, state => state.users.length);
      const firstUserName = useStore(store, state => state.users[0]?.name);

      // Assert
      expect(activeUsers).toEqual([
        { id: 1, name: 'John', active: true },
        { id: 3, name: 'Bob', active: true },
      ]);
      expect(userCount).toBe(3);
      expect(firstUserName).toBe('John');
    });
  });
});
