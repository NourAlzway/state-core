/**
 * @jest-environment node
 */

import {
  initializeAsyncState,
  createAsyncAction,
} from '../core/async-action-handler';
import { createStoreInternal } from '../core/store-internal';
import { AsyncActionFn, AsyncState } from '../types';

describe('async-action-handler - successful execution', () => {
  it('should handle successful async action execution', async () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    initializeAsyncState<typeof initialState, string>(store, 'fetchData');

    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [],
      string
    > = async () => {
      return 'success data';
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchData', mockAsyncFn);
    const promise = asyncAction();

    // Assert
    let currentState = store.getState();
    expect(currentState).toMatchObject({
      fetchData: { loading: true, error: null },
    });

    await promise;

    currentState = store.getState();
    expect(currentState).toMatchObject({
      fetchData: {
        loading: false,
        error: null,
        data: 'success data',
      },
    });
  });

  it('should preserve previous data during loading', async () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    initializeAsyncState<typeof initialState, string>(store, 'fetchData');

    // Act
    store.setState({
      ...initialState,
      fetchData: {
        loading: false,
        error: null,
        data: 'old data',
      } as AsyncState<string>,
    } as any);

    // Arrange
    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [],
      string
    > = async () => {
      return new Promise(resolve => setTimeout(() => resolve('new data'), 10));
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchData', mockAsyncFn);
    const promise = asyncAction();

    // Assert
    let currentState = store.getState();
    expect(currentState).toMatchObject({
      fetchData: {
        loading: true,
        error: null,
        data: 'old data',
      },
    });

    await promise;

    currentState = store.getState();
    expect(currentState).toMatchObject({
      fetchData: {
        loading: false,
        error: null,
        data: 'new data',
      },
    });
  });

  it('should handle async action with parameters', async () => {
    // Arrange
    const initialState = { users: [] };
    const store = createStoreInternal(initialState);
    initializeAsyncState<typeof initialState, { id: number; name: string }>(
      store,
      'fetchUser'
    );

    // Arrange
    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [number],
      { id: number; name: string }
    > = async (_state, userId) => {
      return { id: userId, name: `User ${userId}` };
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchUser', mockAsyncFn);
    await asyncAction(123);

    // Assert
    const state = store.getState();
    expect(state).toMatchObject({
      fetchUser: {
        loading: false,
        error: null,
        data: { id: 123, name: 'User 123' },
      },
    });
  });

  it('should access current state in async function', async () => {
    // Arrange
    const initialState = { multiplier: 2, result: 0 };
    const store = createStoreInternal(initialState);
    initializeAsyncState<typeof initialState, number>(store, 'calculate');

    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [number],
      number
    > = async (state, value) => {
      return value * state.multiplier;
    };

    // Act
    const asyncAction = createAsyncAction(store, 'calculate', mockAsyncFn);
    await asyncAction(5);

    // Assert
    const state = store.getState();
    expect(state).toMatchObject({
      calculate: {
        loading: false,
        error: null,
        data: 10,
      },
    });
  });
});
