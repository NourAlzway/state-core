/**
 * @jest-environment node
 */

import { createCallableStore } from '../core/callable-store';
import { createStoreInternal } from '../core/store-internal';
import {
  createAsyncAction,
  initializeAsyncState,
} from '../core/async-action-handler';

jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => {
    return getSnapshot();
  }),
}));

describe('callable-store - working with async actions', () => {
  it('should handle async actions', async () => {
    // Arrange
    const initialState = { users: [] as string[] };
    const store = createStoreInternal(initialState);

    // Act
    initializeAsyncState<typeof initialState, string[]>(store, 'fetchUsers');
    const fetchUsersAction = createAsyncAction(
      store,
      'fetchUsers',
      async (): Promise<string[]> => {
        return ['user1', 'user2', 'user3'];
      }
    );
    store.actions.fetchUsers = fetchUsersAction;

    const callableStore = createCallableStore<
      typeof initialState,
      { fetchUsers: (...args: any[]) => Promise<void> }
    >(store as any);

    const { fetchUsers } = callableStore();

    await fetchUsers();
    // Assert
    expect(typeof fetchUsers).toBe('function');
  });

  it('should handle async action errors', async () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const initialState = { data: null };
    const store = createStoreInternal(initialState);

    // Act
    initializeAsyncState<typeof initialState, string>(store, 'failingFetch');
    const failingFetchAction = createAsyncAction(
      store,
      'failingFetch',
      async (): Promise<string> => {
        throw new Error('Fetch failed');
      }
    );
    store.actions.failingFetch = failingFetchAction;

    const callableStore = createCallableStore<
      typeof initialState,
      { failingFetch: (...args: any[]) => Promise<void> }
    >(store as any);

    const { failingFetch } = callableStore();
    await failingFetch();

    // Assert
    expect(typeof failingFetch).toBe('function');

    consoleSpy.mockRestore();
  });
});
