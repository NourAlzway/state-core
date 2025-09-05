/**
 * @jest-environment node
 */

import { createCallableStore } from '../core/callable-store';
import { createStoreInternal } from '../core/store-internal';
import { createAction } from '../core/action-handler';

jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => {
    return getSnapshot();
  }),
}));

describe('callable-store - use method', () => {
  it('should provide use method for imperative state access', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    // Act
    const fullState = callableStore.use(state => state);
    const count = callableStore.use(state => state.count);

    // Assert
    expect(fullState).toEqual(initialState);
    expect(count).toBe(0);
  });

  it('should access current state through use method', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    // Act
    store.setState({ count: 10 });

    const count = callableStore.use(state => state.count);

    // Assert
    expect(count).toBe(10);
  });

  it('should include actions and effects in use method result', () => {
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

    // Act
    store.actions.increment = incrementAction;

    const callableStore = createCallableStore<
      typeof initialState,
      { increment: () => void }
    >(store);

    // Act
    const result = callableStore.use(state => ({
      count: state.count,
      hasIncrement: typeof state.increment === 'function',
    }));

    // Assert
    expect(result).toEqual({
      count: 0,
      hasIncrement: true,
    });
  });
});
