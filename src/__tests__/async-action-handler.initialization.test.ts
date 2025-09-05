/**
 * @jest-environment node
 */

import { initializeAsyncState } from '../core/async-action-handler';
import { createStoreInternal } from '../core/store-internal';

describe('async-action-handler - initializeAsyncState', () => {
  it('should initialize async state with default values', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };
    const store = createStoreInternal(initialState);

    // Act
    initializeAsyncState<typeof initialState, string>(store, 'fetchData');
    const state = store.getState();

    // Assert
    expect(state).toMatchObject({
      count: 0,
      name: 'test',
      fetchData: {
        loading: false,
        error: null,
        data: null,
      },
    });
  });

  it('should preserve existing state when initializing async state', () => {
    // Arrange
    const initialState = { users: [], config: { enabled: true } };
    const store = createStoreInternal(initialState);

    // Act
    initializeAsyncState<typeof initialState, { id: number; name: string }[]>(
      store,
      'fetchUsers'
    );

    // Assert
    const state = store.getState();

    expect(state).toMatchObject({
      users: [],
      config: { enabled: true },
      fetchUsers: {
        loading: false,
        error: null,
        data: null,
      },
    });
  });

  it('should handle multiple async state initializations', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);

    // Act
    initializeAsyncState<typeof initialState, string>(store, 'fetchData');
    initializeAsyncState<typeof initialState, number>(store, 'fetchCount');

    // Assert
    const state = store.getState();

    expect(state).toMatchObject({
      count: 0,
      fetchData: { loading: false, error: null, data: null },
      fetchCount: { loading: false, error: null, data: null },
    });
  });
});
