/**
 * @jest-environment node
 */

import { executeEffect } from '../core/effect-handler';
import { createStoreInternal } from '../core/store-internal';
import { EffectFn, StoreConfig } from '../types';

describe('effect-handler - executeEffect', () => {
  describe('synchronous effects', () => {
    it('should execute synchronous effect immediately', () => {
      // Arrange
      const initialState = { count: 0, executed: false };
      const store = createStoreInternal(initialState);
      const syncEffect: EffectFn<typeof initialState> = (state, helpers) => {
        helpers.set({ executed: true });
      };

      // Act
      executeEffect(store, 'syncEffect', syncEffect);

      // Assert
      expect(store.getState().executed).toBe(true);
    });

    it('should pass current state to effect function', () => {
      // Arrange
      const initialState = { count: 5, name: 'test' };
      const store = createStoreInternal(initialState);
      const effectFn = jest.fn();

      // Act

      executeEffect(store, 'testEffect', effectFn);

      // Assert
      expect(effectFn).toHaveBeenCalledWith(
        initialState,
        expect.objectContaining({
          set: expect.any(Function),
          get: expect.any(Function),
        })
      );
    });

    it('should handle effects that modify state multiple times', () => {
      // Arrange
      const initialState = { count: 0, step: 0 };
      const store = createStoreInternal(initialState);
      const multiStepEffect: EffectFn<typeof initialState> = (
        state,
        helpers
      ) => {
        // Act
        helpers.set({ step: 1 });
        helpers.set({ count: helpers.get().count + 1 });
        helpers.set({ step: 2 });
      };

      // Act
      executeEffect(store, 'multiStep', multiStepEffect);

      // Assert
      expect(store.getState()).toEqual({ count: 1, step: 2 });
    });
  });

  describe('asynchronous effects', () => {
    it('should execute asynchronous effects without blocking', async () => {
      // Arrange
      const initialState = { count: 0, asyncCompleted: false };
      const store = createStoreInternal(initialState);

      // Act
      let resolvePromise: () => void;
      const asyncEffect: EffectFn<typeof initialState> = async (_, helpers) => {
        await new Promise<void>(resolve => {
          resolvePromise = resolve;
        });

        // Act
        helpers.set({ asyncCompleted: true });
      };

      // Act
      executeEffect(store, 'asyncEffect', asyncEffect);

      // Assert
      expect(store.getState().asyncCompleted).toBe(false);

      resolvePromise!();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(store.getState().asyncCompleted).toBe(true);
    });

    it('should handle async effect errors with custom error handler', async () => {
      // Arrange
      const errorHandler = jest.fn();
      const config: StoreConfig = { errorHandler };
      const store = createStoreInternal({ count: 0 }, config);

      // Act
      const asyncEffect: EffectFn<{ count: number }> = async () => {
        throw new Error('Async effect error');
      };

      // Act
      executeEffect(store, 'asyncError', asyncEffect);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Async effect error' }),
        'Effect asyncError (async)'
      );
    });

    it('should handle async effect errors with console.error fallback', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const store = createStoreInternal({ count: 0 });

      // Act
      const asyncEffect: EffectFn<{ count: number }> = async () => {
        throw new Error('Async effect error');
      };

      executeEffect(store, 'asyncError', asyncEffect);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Effect asyncError failed:',
        expect.objectContaining({ message: 'Async effect error' })
      );

      consoleSpy.mockRestore();
    });
  });
});
