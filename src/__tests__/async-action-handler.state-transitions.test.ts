/**
 * @jest-environment node
 */

import {
  initializeAsyncState,
  createAsyncAction,
} from '../core/async-action-handler';
import { createStoreInternal } from '../core/store-internal';
import { AsyncActionFn } from '../types';

describe('async-action-handler - state transitions', () => {
  it('should correctly transition through loading states', async () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    initializeAsyncState<typeof initialState, string>(store, 'fetchData');

    // Act
    const stateSnapshots: any[] = [];
    const listener = jest.fn(newState => {
      const fetchData = (newState as any).fetchData;
      if (fetchData) {
        stateSnapshots.push({ ...fetchData });
      }
    });
    store.subscribe(listener);

    // Arrange
    let resolvePromise: (value: string) => void;
    const mockAsyncFn: AsyncActionFn<
      typeof initialState,
      [],
      string
    > = async () => {
      return new Promise<string>(resolve => {
        resolvePromise = resolve;
      });
    };

    // Act
    const asyncAction = createAsyncAction(store, 'fetchData', mockAsyncFn);
    const promise = asyncAction();

    setTimeout(() => resolvePromise!('completed'), 10);
    await promise;

    // Assert
    expect(stateSnapshots).toHaveLength(2);
    expect(stateSnapshots[0]).toMatchObject({
      loading: true,
      error: null,
      data: null,
    });
    expect(stateSnapshots[1]).toMatchObject({
      loading: false,
      error: null,
      data: 'completed',
    });
  });
});
