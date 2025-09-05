/**
 * @jest-environment node
 */

const mockUseSyncExternalStore = jest.fn();

jest.mock('react', () => ({
  useSyncExternalStore: mockUseSyncExternalStore,
}));

import { useStore } from '../hooks/use-store';
import { createStoreInternal } from '../core/store-internal';

describe('hooks - useStore type safety', () => {
  beforeEach(() => {
    mockUseSyncExternalStore.mockClear();
  });

  it('should handle different return types from selectors', () => {
    // Arrange
    const initialState = {
      count: 42,
      name: 'test',
      settings: { theme: 'dark', notifications: true },
    };
    const store = createStoreInternal(initialState);

    // Act
    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    // Assert
    const count: number = useStore(store, state => state.count);
    const name: string = useStore(store, state => state.name);
    const theme: string = useStore(store, state => state.settings.theme);
    const isNotificationsEnabled: boolean = useStore(
      store,
      state => state.settings.notifications
    );
    const fullState: typeof initialState = useStore(store);

    expect(count).toBe(42);
    expect(name).toBe('test');
    expect(theme).toBe('dark');
    expect(isNotificationsEnabled).toBe(true);
    expect(fullState).toEqual(initialState);
  });
});
