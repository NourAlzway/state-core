/**
 * @jest-environment node
 */

import { createStore } from '../store';
import { StoreConfig } from '../types';

// Mock React's useSyncExternalStore for integration tests
jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => getSnapshot()),
}));

describe('integration - error handling', () => {
  it('should handle action errors with custom error handler', () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler };

    // Act
    const store = createStore({ count: 0 }, config)
      .action('errorAction', () => {
        throw new Error('Action error');
      })
      .build();

    // Assert
    const { errorAction } = store();

    expect(() => errorAction()).toThrow('Action error');
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Action error' }),
      'Action errorAction',
      []
    );
  });

  it('should handle effect errors', () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler };

    // Act
    createStore({ count: 0 }, config)
      .effect('errorEffect', () => {
        throw new Error('Effect error');
      })
      .build();

    // Assert
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Effect error' }),
      'Effect errorEffect'
    );
  });

  it('should handle listener errors', () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler };

    // Act
    const errorListener = jest.fn(() => {
      throw new Error('Listener error');
    });

    // Force a state change by creating a new store that will have actions
    const testStore = createStore({ count: 0 }, config)
      .action('increment', state => ({ count: state.count + 1 }))
      .build();

    testStore.subscribe(errorListener);
    const { increment } = testStore();

    try {
      increment();
    } catch {
      // Expected error
    }

    // Assert
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Listener error' }),
      'Listener'
    );
  });
});
