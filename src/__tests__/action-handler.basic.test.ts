/**
 * @jest-environment node
 */

import { createAction } from '../core/action-handler';
import { createStoreInternal } from '../core/store-internal';

describe('action-handler - basic functionality', () => {
  it('should execute actions and update state', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const increment = createAction(
      store,
      'increment',
      (state, value: number) => ({
        count: state.count + value,
      })
    );

    // Act
    increment(5);

    // Assert
    expect(store.getState()).toEqual({ count: 5 });
  });

  it('should handle parameterless actions', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const increment = createAction(store, 'increment', state => ({
      count: state.count + 1,
    }));

    // Act
    increment();

    // Assert
    expect(store.getState()).toEqual({ count: 1 });
  });

  it('should handle multiple parameters', () => {
    // Arrange
    const store = createStoreInternal({ x: 0, y: 0, name: 'point' });
    const setPosition = createAction(
      store,
      'setPosition',
      (_state, x: number, y: number, name: string) => ({ x, y, name })
    );

    // Act
    setPosition(10, 20, 'new point');

    // Assert
    expect(store.getState()).toEqual({ x: 10, y: 20, name: 'new point' });
  });

  it('should access current state for sequential calls', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const increment = createAction(
      store,
      'increment',
      (state, value: number) => ({
        count: state.count + value,
      })
    );

    // Act
    increment(1);
    increment(2);
    increment(3);

    // Assert
    expect(store.getState()).toEqual({ count: 6 });
  });

  it('should handle multiple actions on same store', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });
    const increment = createAction(store, 'increment', state => ({
      count: state.count + 1,
    }));
    const decrement = createAction(store, 'decrement', state => ({
      count: state.count - 1,
    }));

    // Act
    increment();
    increment();
    decrement();
    increment();

    // Assert
    expect(store.getState()).toEqual({ count: 2 });
  });
});
