/**
 * @jest-environment node
 */

import { createAction } from '../core/action-handler';
import { createStoreInternal } from '../core/store-internal';

describe('action-handler - error handling', () => {
  it('should handle action errors with custom error handler', () => {
    // Arrange
    const errorHandler = jest.fn();
    const store = createStoreInternal({ count: 0 }, { errorHandler });
    const errorAction = createAction(store, 'errorAction', () => {
      throw new Error('Action failed');
    });

    // Act & Assert
    expect(() => errorAction()).toThrow('Action failed');
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Action failed' }),
      'Action errorAction',
      []
    );
  });

  it('should fallback to console.error when no custom handler', () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const store = createStoreInternal({ count: 0 });
    const errorAction = createAction(store, 'errorAction', () => {
      throw new Error('Action failed');
    });

    // Act & Assert
    expect(() => errorAction()).toThrow('Action failed');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Action errorAction failed:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should convert non-Error values to Error objects', () => {
    // Arrange
    const errorHandler = jest.fn();
    const store = createStoreInternal({ count: 0 }, { errorHandler });
    const errorAction = createAction(store, 'stringError', () => {
      throw 'String error';
    });

    // Act & Assert
    expect(() => errorAction()).toThrow('String error');
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'String error' }),
      'Action stringError',
      []
    );
  });

  it('should not update state when action throws', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const errorAction = createAction(store, 'errorAction', () => {
      throw new Error('Action failed');
    });

    // Act & Assert
    expect(() => errorAction()).toThrow('Action failed');
    expect(store.getState()).toEqual(initialState);

    consoleSpy.mockRestore();
  });

  it('should pass action arguments to error handler', () => {
    // Arrange
    const errorHandler = jest.fn();
    const store = createStoreInternal({ count: 0 }, { errorHandler });
    const errorAction = createAction(store, 'errorAction', () => {
      throw new Error('Action failed');
    });

    // Act & Assert
    expect(() => errorAction(42, 'test')).toThrow('Action failed');
    expect(errorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      'Action errorAction',
      [42, 'test']
    );
  });
});
