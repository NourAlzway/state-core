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

describe('callable-store - complex integration scenarios', () => {
  it('should handle store with all features combined', () => {
    // Arrange
    const initialState = {
      count: 0,
      users: [] as { id: number; name: string }[],
      message: 'initial',
    };
    const store = createStoreInternal(initialState);
    // Act
    store.actions.increment = createAction(
      store,
      'increment',
      (state: typeof initialState) => ({
        count: state.count + 1,
      })
    );

    store.actions.addUser = createAction(
      store,
      'addUser',
      (state: typeof initialState, ...args: any[]) => ({
        users: [...state.users, args[0] as { id: number; name: string }],
      })
    );

    store.actions.reset = createAction(store, 'reset', () => ({
      count: 0,
      users: [],
      message: 'reset',
    }));

    store.effects.logMessage = (_state, helpers, ...args: unknown[]): void => {
      const [newMessage] = args as [string];
      helpers.set({ message: newMessage });
    };

    const callableStore = createCallableStore<
      typeof initialState,
      {
        increment: (...args: any[]) => void;
        addUser: (...args: any[]) => void;
        reset: (...args: any[]) => void;
      }
    >(store);

    const { increment, addUser, reset } = callableStore();
    const storeInstance = callableStore();

    increment();
    addUser({ id: 1, name: 'John' });

    (storeInstance as any).logMessage('effect message');

    // Assert
    let finalState = callableStore.use(s => s);
    expect(finalState.count).toBe(1);
    expect(finalState.users).toEqual([{ id: 1, name: 'John' }]);
    expect(finalState.message).toBe('effect message');

    reset();
    finalState = callableStore.use(s => s);
    expect(finalState.count).toBe(0);
    expect(finalState.users).toEqual([]);
    expect(finalState.message).toBe('reset');
  });
});
