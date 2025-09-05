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

describe('callable-store - working with actions', () => {
  it('should execute actions and update state', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    const incrementAction = createAction(
      store,
      'increment',
      (state: typeof initialState, amount: number = 1) => ({
        count: state.count + amount,
      })
    );
    store.actions.increment = incrementAction;
    // Act

    const callableStore = createCallableStore<
      typeof initialState,
      { increment: (...args: any[]) => void }
    >(store);

    const { increment } = callableStore();
    increment(5);

    // Assert
    const state = callableStore.use(s => s);
    expect(state.count).toBe(5);
  });

  it('should handle multiple actions', () => {
    // Arrange
    const initialState = { count: 0, name: 'initial' };
    const store = createStoreInternal(initialState);

    // Act
    store.actions.increment = createAction(
      store,
      'increment',
      (state: typeof initialState) => ({
        count: state.count + 1,
      })
    );

    // Act
    store.actions.setName = createAction(
      store,
      'setName',
      (state: typeof initialState, ...args: any[]) => ({
        name: args[0] as string,
      })
    );

    // Act
    store.actions.reset = createAction(store, 'reset', () => ({
      count: 0,
      name: 'initial',
    }));

    // Act
    const callableStore = createCallableStore<
      typeof initialState,
      {
        increment: (...args: any[]) => void;
        setName: (...args: any[]) => void;
        reset: (...args: any[]) => void;
      }
    >(store);

    // Act
    const { increment, setName, reset } = callableStore();
    increment();
    setName('updated');

    // Assert
    let state = callableStore.use(s => ({ count: s.count, name: s.name }));
    expect(state).toEqual({ count: 1, name: 'updated' });

    reset();
    state = callableStore.use(s => ({ count: s.count, name: s.name }));
    expect(state).toEqual({ count: 0, name: 'initial' });

    expect(typeof increment).toBe('function');
    expect(typeof setName).toBe('function');
    expect(typeof reset).toBe('function');
  });
});
