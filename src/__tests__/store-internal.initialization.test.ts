/**
 * @jest-environment node
 */

import { createStoreInternal } from '../core/store-internal';
import { StoreConfig } from '../types';

describe('store-internal - initialization', () => {
  it('should create store with initial state and empty collections', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };

    // Act
    const store = createStoreInternal(initialState);

    // Assert
    expect(store.getState()).toEqual(initialState);
    expect(store.actions).toEqual({});
    expect(store.effects).toEqual({});
    expect(store.config).toEqual({});
  });

  it('should create store with custom config', () => {
    // Arrange
    const config: StoreConfig = { devMode: true, errorHandler: jest.fn() };
    const initialState = { count: 0 };

    // Act
    const store = createStoreInternal(initialState, config);

    // Assert
    expect(store.config).toBe(config);
    expect(store.config.devMode).toBe(true);
    expect(store.config.errorHandler).toBe(config.errorHandler);
  });

  it('should return current state through getState', () => {
    // Arrange & Act
    const store = createStoreInternal({ count: 5, active: true });

    // Assert
    expect(store.getState()).toEqual({ count: 5, active: true });
  });

  it('should return updated state after setState', () => {
    // Arrange
    const store = createStoreInternal({ count: 0 });

    // Act
    store.setState({ count: 10 });

    // Assert
    expect(store.getState()).toEqual({ count: 10 });
  });
});
