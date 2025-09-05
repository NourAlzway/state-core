/**
 * @jest-environment node
 */

import { createAction } from '../core/action-handler';
import { createStoreInternal } from '../core/store-internal';

describe('action-handler - state updates', () => {
  it('should merge partial updates correctly', () => {
    // Arrange
    const store = createStoreInternal({ count: 0, name: 'test', active: true });
    const setCount = createAction(
      store,
      'setCount',
      (_state, count: number) => ({ count })
    );

    // Act
    setCount(42);

    // Assert
    expect(store.getState()).toEqual({ count: 42, name: 'test', active: true });
  });

  it('should handle nested objects with shallow merge', () => {
    // Arrange
    const store = createStoreInternal({
      user: { name: 'John', age: 30 },
      count: 5,
    });
    const updateUser = createAction(
      store,
      'updateUser',
      (_state, name: string) => ({
        user: { name },
      })
    );

    // Act
    updateUser('Jane');

    // Assert
    expect(store.getState()).toEqual({ user: { name: 'Jane' }, count: 5 });
  });

  it('should preserve nested properties with spread operator', () => {
    // Arrange
    const store = createStoreInternal({
      user: { name: 'John', age: 30 },
      count: 5,
    });
    const updateUserName = createAction(
      store,
      'updateUserName',
      (state, name: string) => ({
        user: { ...state.user, name },
      })
    );

    // Act
    updateUserName('Jane');

    // Assert
    expect(store.getState()).toEqual({
      user: { name: 'Jane', age: 30 },
      count: 5,
    });
  });

  it('should handle null return values', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const setNull = createAction(store, 'setNull', () => null as any);

    // Act
    setNull();

    // Assert
    expect(store.getState()).toBe(null);
  });

  it('should handle empty object returns', () => {
    // Arrange
    const store = createStoreInternal({ count: 0, name: 'test' });
    const noChange = createAction(store, 'noChange', () => ({}));

    // Act
    noChange();

    // Assert
    expect(store.getState()).toEqual({ count: 0, name: 'test' });
  });

  it('should handle array updates immutably', () => {
    // Arrange
    const store = createStoreInternal({ items: [1, 2, 3], total: 6 });
    const addItem = createAction(store, 'addItem', (state, item: number) => ({
      items: [...state.items, item],
      total: state.total + item,
    }));

    // Act
    addItem(4);

    // Assert
    expect(store.getState()).toEqual({ items: [1, 2, 3, 4], total: 10 });
  });

  it('should handle deeply nested state updates', () => {
    // Arrange
    const store = createStoreInternal({
      user: { profile: { name: 'John', preferences: { theme: 'dark' } } },
      posts: [{ id: 1, title: 'Hello' }],
    });
    const updateTheme = createAction(
      store,
      'updateTheme',
      (state, theme: string) => ({
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            preferences: { ...state.user.profile.preferences, theme },
          },
        },
      })
    );

    // Act
    updateTheme('light');

    // Assert
    const newState = store.getState();
    expect(newState.user.profile.preferences.theme).toBe('light');
    expect(newState.user.profile.name).toBe('John');
    expect(newState.posts).toEqual([{ id: 1, title: 'Hello' }]);
  });
});
