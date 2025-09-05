/**
 * @jest-environment node
 */

import { executeEffect } from '../core/effect-handler';
import { createStoreInternal } from '../core/store-internal';
import { EffectFn, StoreConfig } from '../types';

describe('effect-handler - error handling', () => {
  it('should handle sync effect errors with custom error handler', () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler };
    const store = createStoreInternal({ count: 0 }, config);

    // Act
    const errorEffect: EffectFn<{ count: number }> = () => {
      throw new Error('Sync effect error');
    };

    // Act
    executeEffect(store, 'errorEffect', errorEffect);

    // Assert
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Sync effect error' }),
      'Effect errorEffect'
    );
  });

  it('should handle sync effect errors with console.error fallback', () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const store = createStoreInternal({ count: 0 });

    // Act
    const errorEffect: EffectFn<{ count: number }> = () => {
      throw new Error('Sync effect error');
    };

    // Act
    executeEffect(store, 'errorEffect', errorEffect);

    // Assert
    expect(consoleSpy).toHaveBeenCalledWith(
      'Effect errorEffect failed:',
      expect.objectContaining({ message: 'Sync effect error' })
    );

    consoleSpy.mockRestore();
  });

  it('should convert non-Error thrown values to Error objects', () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler };
    const store = createStoreInternal({ count: 0 }, config);

    // Act
    const errorEffect: EffectFn<{ count: number }> = () => {
      throw 'String error';
    };

    // Act
    executeEffect(store, 'stringError', errorEffect);

    // Assert
    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'String error' }),
      'Effect stringError'
    );
  });
});
