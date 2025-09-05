/**
 * @jest-environment node
 */

import { createStoreInternal } from '../core/store-internal';

describe('store-internal - state management', () => {
  it('should merge partial state updates', () => {
    // Arrange
    const store = createStoreInternal({
      count: 0,
      name: 'initial',
      active: true,
    });

    // Act
    store.setState({ count: 5 });

    // Assert
    expect(store.getState()).toEqual({
      count: 5,
      name: 'initial',
      active: true,
    });
  });

  it('should handle complete state replacement', () => {
    // Arrange
    const store = createStoreInternal({ count: 0, name: 'initial' });
    const newState = { count: 10, name: 'updated', active: true };

    // Act
    store.setState(newState);

    // Assert
    expect(store.getState()).toEqual(newState);
  });

  it('should handle null state updates gracefully', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });

    // Act
    store.setState(null as any);

    // Assert
    expect(store.getState()).toBe(null);
  });

  it('should perform shallow merge on nested objects', () => {
    // Arrange
    const store = createStoreInternal({
      user: { name: 'John', age: 30 },
      count: 5,
    });

    // Act - This should replace the entire user object
    store.setState({ user: { name: 'Jane' } });

    // Assert - age should be lost due to shallow merge
    expect(store.getState()).toEqual({ user: { name: 'Jane' }, count: 5 });
  });

  it('should handle deeply nested state structures', () => {
    // Arrange
    const store = createStoreInternal({
      user: { profile: { name: 'John', settings: { theme: 'dark' } } },
      posts: [{ id: 1, title: 'Hello' }],
      metadata: { version: '1.0', lastUpdated: new Date() },
    });

    // Act
    store.setState({
      user: { profile: { name: 'Jane', settings: { theme: 'light' } } },
    });

    // Assert
    const state = store.getState();
    expect(state.user.profile.name).toBe('Jane');
    expect(state.posts).toEqual([{ id: 1, title: 'Hello' }]);
  });

  it('should handle array state updates', () => {
    // Arrange
    const store = createStoreInternal({ items: [1, 2, 3], total: 6 });

    // Act
    store.setState({ items: [1, 2, 3, 4], total: 10 });

    // Assert
    expect(store.getState()).toEqual({ items: [1, 2, 3, 4], total: 10 });
  });
});
