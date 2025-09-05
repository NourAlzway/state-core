/**
 * @jest-environment node
 */

import { createStore } from '../store';

// Mock React's useSyncExternalStore for integration tests
jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => getSnapshot()),
}));

describe('integration - hooks', () => {
  it('should create React hook from store', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };

    // Act
    const useStore = createStore(initialState)
      .action('increment', state => ({ count: state.count + 1 }))
      .action('setName', (state, name: string) => ({ name }))
      .asHook();

    // Assert
    expect(typeof useStore).toBe('function');
  });
});
