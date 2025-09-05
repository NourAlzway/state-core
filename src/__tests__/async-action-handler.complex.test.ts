/**
 * @jest-environment node
 */

import {
  initializeAsyncState,
  createAsyncAction,
} from '../core/async-action-handler';
import { createStoreInternal } from '../core/store-internal';
import { AsyncActionFn } from '../types';

describe('async-action-handler - complex scenarios', () => {
  it('should handle async actions that modify other state', async () => {
    // Arrange
    const initialState = { count: 0, lastUpdated: null as Date | null };
    const store = createStoreInternal(initialState);
    initializeAsyncState<typeof initialState, number>(store, 'incrementAsync');

    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [number],
      number
    > = async (state, increment) => {
      await new Promise(resolve => setTimeout(resolve, 1));

      store.setState({
        ...store.getState(),
        lastUpdated: new Date(),
      } as any);

      return state.count + increment;
    };

    // Act
    const asyncAction = createAsyncAction(store, 'incrementAsync', mockAsyncFn);
    await asyncAction(5);

    // Assert
    const state = store.getState();
    expect(state).toMatchObject({
      incrementAsync: {
        loading: false,
        error: null,
        data: 5,
      },
    });
    expect((state as any).lastUpdated).toBeInstanceOf(Date);
  });

  it('should handle multiple async actions with different return types', async () => {
    // Arrange
    const initialState = { config: { apiUrl: 'https://api.example.com' } };
    const store = createStoreInternal(initialState);

    initializeAsyncState<typeof initialState, string[]>(
      store,
      'fetchUsernames'
    );
    initializeAsyncState<typeof initialState, number>(store, 'fetchCount');
    initializeAsyncState<typeof initialState, { success: boolean }>(
      store,
      'validateConfig'
    );

    const fetchUsernames = createAsyncAction(
      store,
      'fetchUsernames',
      async (): Promise<string[]> => ['user1', 'user2', 'user3']
    );

    const fetchCount = createAsyncAction(
      store,
      'fetchCount',
      async (): Promise<number> => 42
    );

    const validateConfig = createAsyncAction(
      store,
      'validateConfig',
      async (): Promise<{ success: boolean }> => ({ success: true })
    );

    // Act
    await Promise.all([fetchUsernames(), fetchCount(), validateConfig()]);

    // Assert
    const state = store.getState();
    expect(state).toMatchObject({
      fetchUsernames: {
        loading: false,
        error: null,
        data: ['user1', 'user2', 'user3'],
      },
      fetchCount: {
        loading: false,
        error: null,
        data: 42,
      },
      validateConfig: {
        loading: false,
        error: null,
        data: { success: true },
      },
    });
  });
});
