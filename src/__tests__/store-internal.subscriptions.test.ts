/**
 * @jest-environment node
 */

import { createStoreInternal } from '../core/store-internal';

describe('store-internal - subscriptions', () => {
  it('should return unsubscribe function', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });

    // Act
    const unsubscribe = store.subscribe(jest.fn());

    // Assert
    expect(typeof unsubscribe).toBe('function');
  });

  it('should notify all listeners when state changes', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    store.subscribe(listener1);
    store.subscribe(listener2);

    // Act
    store.setState({ count: 1 });

    // Assert
    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should stop notifications after unsubscribe', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    // Act & Assert
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should skip notification when state does not change', () => {
    // Arrange
    const store = createStoreInternal({ count: 0, name: 'test' });
    const listener = jest.fn();
    store.subscribe(listener);

    // Act
    store.setState({ count: 0, name: 'test' });

    // Assert
    expect(listener).not.toHaveBeenCalled();
  });

  it('should notify listeners on state change with new and previous state', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const listener = jest.fn();
    store.subscribe(listener);

    // Act
    store.setState({ count: 1 });

    // Assert
    expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
  });

  it('should call listeners with new and previous state', () => {
    // Arrange
    const store = createStoreInternal({ count: 0, name: 'test' });
    const listener = jest.fn();
    store.subscribe(listener);

    // Act
    store.setState({ count: 5, name: 'updated' });

    // Assert
    expect(listener).toHaveBeenCalledWith(
      { count: 5, name: 'updated' },
      { count: 0, name: 'test' }
    );
  });

  it('should handle rapid sequential state changes', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const listener = jest.fn();
    store.subscribe(listener);

    // Act
    store.setState({ count: 1 });
    store.setState({ count: 2 });
    store.setState({ count: 3 });

    // Assert
    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenNthCalledWith(1, { count: 1 }, { count: 0 });
    expect(listener).toHaveBeenNthCalledWith(2, { count: 2 }, { count: 1 });
    expect(listener).toHaveBeenNthCalledWith(3, { count: 3 }, { count: 2 });
  });
});
