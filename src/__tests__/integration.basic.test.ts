/**
 * @jest-environment node
 */

import { createStore } from '../store';
import { StoreConfig } from '../types';

// Mock React's useSyncExternalStore for integration tests
jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => getSnapshot()),
}));

describe('integration - basic store creation', () => {
  it('should create a store with initial state', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };

    // Act
    const store = createStore(initialState).build();

    // Assert
    const state = store.use(s => s);
    expect(state).toEqual(initialState);
  });

  it('should create store with config', () => {
    // Arrange
    const errorHandler = jest.fn();
    const config: StoreConfig = { errorHandler, devMode: true };
    const initialState = { count: 0 };

    // Act
    const store = createStore(initialState, config).build();

    // Assert
    expect(store).toBeDefined();
    const state = store.use(s => s);
    expect(state).toEqual(initialState);
  });
});
