/**
 * @jest-environment node
 */

import {
  initializeAsyncState,
  createAsyncAction,
} from '../core/async-action-handler';
import { createStoreInternal } from '../core/store-internal';
import { AsyncActionFn, StoreConfig, AsyncState } from '../types';

describe('async-action-handler - error handling', () => {
  it('should handle async action errors', async () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    initializeAsyncState<typeof initialState, string>(store, 'fetchData');

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [],
      string
    > = async () => {
      throw new Error('Fetch failed');
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchData', mockAsyncFn);
    await asyncAction();

    // Assert
    const state = store.getState();
    expect(state).toMatchObject({
      fetchData: {
        loading: false,
        error: expect.objectContaining({ message: 'Fetch failed' }),
        data: null,
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      'AsyncAction fetchData failed:',
      expect.any(Error)
    );

    // Cleanup
    consoleSpy.mockRestore();
  });

  it('should handle async action errors with custom error handler', async () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler };
    const store = createStoreInternal({ count: 0 }, config);
    initializeAsyncState<{ count: number }, string>(store, 'fetchData');

    const mockAsyncFn: AsyncActionFn<
      { count: number },
      [number],
      string
    > = async () => {
      throw new Error('Custom error');
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchData', mockAsyncFn);
    await asyncAction(42);

    // Assert
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Custom error' }),
      'AsyncAction fetchData',
      [42]
    );
  });

  it('should convert non-Error thrown values to Error objects', async () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler };
    const store = createStoreInternal({ count: 0 }, config);
    initializeAsyncState<{ count: number }, string>(store, 'fetchData');

    const mockAsyncFn: AsyncActionFn<
      { count: number },
      [],
      string
    > = async () => {
      throw 'String error';
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchData', mockAsyncFn);
    await asyncAction();

    // Assert
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'String error' }),
      'AsyncAction fetchData',
      []
    );
  });

  it('should preserve previous data when error occurs', async () => {
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
        data: 'existing data',
      } as AsyncState<string>,
    } as any);

    // Arrange
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [],
      string
    > = async () => {
      throw new Error('Fetch failed');
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchData', mockAsyncFn);
    await asyncAction();

    // Assert
    const state = store.getState();
    expect(state).toMatchObject({
      fetchData: {
        loading: false,
        error: expect.objectContaining({ message: 'Fetch failed' }),
        data: 'existing data',
      },
    });

    // Cleanup
    consoleSpy.mockRestore();
  });
});
