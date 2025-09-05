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

describe('callable-store - selector functionality', () => {
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
    // Act
    const callableStore = createCallableStore(store);

    const activeUsers = callableStore(state =>
      state.users.filter(user => user.active)
    );

    const userNames = callableStore(state =>
      state.users.map(user => user.name)
    );

    const userCount = callableStore(state => state.users.length);

    // Assert
    expect(activeUsers).toEqual([
      { id: 1, name: 'John', active: true },
      { id: 3, name: 'Bob', active: true },
    ]);
    expect(userNames).toEqual(['John', 'Jane', 'Bob']);
    expect(userCount).toBe(3);
  });

  it('should handle selectors that access actions', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    store.actions.increment = createAction(
      store,
      'increment',
      (state: typeof initialState) => ({
        count: state.count + 1,
      })
    );

    // Act
    const callableStore = createCallableStore<
      typeof initialState,
      { increment: () => void }
    >(store);

    const hasIncrementAction = callableStore(
      state => typeof state.increment === 'function'
    );
    const stateWithActionInfo = callableStore(state => ({
      count: state.count,
      hasActions: typeof state.increment === 'function',
    }));

    // Assert
    expect(hasIncrementAction).toBe(true);
    expect(stateWithActionInfo).toEqual({
      count: 0,
      hasActions: true,
    });
  });
});
