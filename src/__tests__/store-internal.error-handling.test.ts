/**
 * @jest-environment node
 */

import { createStoreInternal } from '../core/store-internal';

describe('store-internal - error handling', () => {
  it('should handle listener errors with custom error handler', () => {
    // Arrange
    const errorHandler = jest.fn();
    const store = createStoreInternal({ count: 0 }, { errorHandler });
    const errorListener = () => {
      throw new Error('Listener error');
    };
    store.subscribe(errorListener);

    // Act
    store.setState({ count: 1 });

    // Assert
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Listener error' }),
      'Listener'
    );
  });

  it('should handle listener errors with console.error when no custom handler', () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const store = createStoreInternal({ count: 0 });
    const errorListener = () => {
      throw new Error('Listener error');
    };
    store.subscribe(errorListener);

    // Act
    store.setState({ count: 1 });

    // Assert
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Store: Listener error:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should convert non-Error thrown values to Error objects', () => {
    // Arrange
    const errorHandler = jest.fn();
    const store = createStoreInternal({ count: 0 }, { errorHandler });
    const errorListener = () => {
      throw 'String error';
    };
    store.subscribe(errorListener);

    // Act
    store.setState({ count: 1 });

    // Assert
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'String error' }),
      'Listener'
    );
  });

  it('should continue notifying other listeners if one fails', () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const store = createStoreInternal({ count: 0 });
    const errorListener = () => {
      throw new Error('Failed listener');
    };
    const successListener = jest.fn();

    store.subscribe(errorListener);
    store.subscribe(successListener);

    // Act
    store.setState({ count: 1 });

    // Assert
    expect(successListener).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
