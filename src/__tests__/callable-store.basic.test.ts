/**
 * @jest-environment node
 */

import { createCallableStore } from '../core/callable-store';
import { createStoreInternal } from '../core/store-internal';
import { createAction } from '../core/action-handler';
import { EffectFn } from '../types';

jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => {
    return getSnapshot();
  }),
}));

describe('callable-store - basic functionality', () => {
  it('should create callable store from internal store', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };
    const store = createStoreInternal(initialState);

    // Act
    const callableStore = createCallableStore(store);

    // Assert
    expect(typeof callableStore).toBe('function');
    expect(typeof callableStore.use).toBe('function');
    expect(typeof callableStore.subscribe).toBe('function');
  });

  it('should return state when called without selector', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    // Act
    const state = callableStore();

    // Assert
    expect(state).toEqual(initialState);
  });

  it('should return selected value when called with selector', () => {
    // Arrange
    const initialState = { count: 42, name: 'test', active: true };
    const store = createStoreInternal(initialState);
    const callableStore = createCallableStore(store);

    // Act
    const count = callableStore(state => state.count);
    const name = callableStore(state => state.name);

    // Assert
    expect(count).toBe(42);
    expect(name).toBe('test');
  });

  it('should include actions in returned state', () => {
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    const incrementAction = createAction(
      store,
      'increment',
      (state: typeof initialState) => ({
        count: state.count + 1,
      })
    );
    store.actions.increment = incrementAction;

    const callableStore = createCallableStore<
      typeof initialState,
      { increment: () => void }
    >(store);

    const storeInstance = callableStore();

    expect(storeInstance).toHaveProperty('count', 0);
    expect(storeInstance).toHaveProperty('increment');
    expect(typeof storeInstance.increment).toBe('function');
  });

  it('should include effects in returned state', () => {
    const initialState = { message: 'initial' };
    const store = createStoreInternal(initialState);
    const logEffect: EffectFn<typeof initialState> = (
      state,
      helpers,
      ...args: unknown[]
    ) => {
      const [newMessage] = args as [string];
      helpers.set({ message: newMessage });
    };
    store.effects.log = logEffect;

    const callableStore = createCallableStore(store);

    const storeInstance = callableStore();

    expect(storeInstance).toHaveProperty('message', 'initial');
    expect(storeInstance).toHaveProperty('log');
    expect(typeof (storeInstance as any).log).toBe('function');
  });
});
