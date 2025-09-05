/**
 * @jest-environment node
 */

import { createCallableStore } from '../core/callable-store';
import { createStoreInternal } from '../core/store-internal';

jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => {
    return getSnapshot();
  }),
}));

describe('callable-store - working with effects', () => {
  it('should make bound effects available', () => {
    // Arrange
    const initialState = { message: 'initial', count: 0 };
    const store = createStoreInternal(initialState);

    // Act
    store.effects.updateMessage = (
      state,
      helpers,
      ...args: unknown[]
    ): void => {
      const [newMessage] = args as [string];
      helpers.set({ message: newMessage });
    };

    store.effects.increment = (state, helpers): void => {
      helpers.set({ count: state.count + 1 });
    };

    const callableStore = createCallableStore(store);

    const storeInstance = callableStore();

    // Assert
    expect(typeof (storeInstance as any).updateMessage).toBe('function');
    expect(typeof (storeInstance as any).increment).toBe('function');
  });

  it('should execute bound effects', () => {
    // Arrange
    const initialState = { message: 'initial' };
    const store = createStoreInternal(initialState);

    // Act
    store.effects.setMessage = (_state, helpers, ...args: unknown[]): void => {
      const [newMessage] = args as [string];
      helpers.set({ message: newMessage });
    };

    const callableStore = createCallableStore(store);

    const storeInstance = callableStore();
    (storeInstance as any).setMessage('updated');

    // Assert
    const state = callableStore.use(s => s);
    expect(state.message).toBe('updated');
  });
});
