/**
 * @jest-environment node
 */

import { createEffectHelpers } from '../core/effect-handler';
import { createStoreInternal } from '../core/store-internal';

describe('effect-handler - helpers', () => {
  it('should create helpers with set and get methods', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };
    const store = createStoreInternal(initialState);

    // Act
    const helpers = createEffectHelpers(store);

    // Assert
    expect(helpers).toHaveProperty('set');
    expect(helpers).toHaveProperty('get');
    expect(typeof helpers.set).toBe('function');
    expect(typeof helpers.get).toBe('function');
  });

  it('should allow getting current state', () => {
    // Arrange
    const initialState = { count: 42, active: true };
    const store = createStoreInternal(initialState);
    const helpers = createEffectHelpers(store);

    // Act
    const state = helpers.get();

    // Assert
    expect(state).toEqual(initialState);
  });

  it('should allow setting state through helpers', () => {
    // Arrange
    const initialState = { count: 0, name: 'initial' };
    const store = createStoreInternal(initialState);
    const helpers = createEffectHelpers(store);

    // Act
    helpers.set({ count: 10 });

    // Assert
    expect(store.getState()).toEqual({ count: 10, name: 'initial' });
  });

  it('should allow complete state replacement through helpers', () => {
    // Arrange
    const initialState = { count: 0, name: 'initial' };
    const store = createStoreInternal(initialState);
    const helpers = createEffectHelpers(store);

    // Act
    helpers.set({ count: 20, name: 'replaced' });

    // Assert
    expect(store.getState()).toEqual({ count: 20, name: 'replaced' });
  });
});
