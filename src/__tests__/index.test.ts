/**
 * @jest-environment node
 */

import { createStore, useStore, deepEqual, deepClone } from '../index';

// eslint-disable-next-line no-console
const originalConsoleWarn = console.warn;
// eslint-disable-next-line no-console
const originalConsoleError = console.error;

beforeAll(() => {
  // eslint-disable-next-line no-console
  console.warn = jest.fn();
  // eslint-disable-next-line no-console
  console.error = jest.fn();
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.warn = originalConsoleWarn;
  // eslint-disable-next-line no-console
  console.error = originalConsoleError;
});

describe('index - main exports', () => {
  it('should export createStore function that builds working stores', () => {
    // Arrange & Act
    const store = createStore({ count: 0 }).build();

    // Assert
    expect(typeof createStore).toBe('function');
    expect(typeof store).toBe('function');
  });

  it('should export utility functions', () => {
    // Arrange & Act & Assert
    expect(typeof useStore).toBe('function');
    expect(typeof deepEqual).toBe('function');
    expect(typeof deepClone).toBe('function');
  });

  it('should create functional store with actions through builder API', () => {
    // Arrange
    const initialState = { count: 0, message: 'hello' };
    const store = createStore(initialState)
      .action('increment', state => ({ count: state.count + 1 }))
      .action('setMessage', (_state, message: string) => ({ message }))
      .build();

    // Act
    const { increment, setMessage } = store();
    increment();
    setMessage('world');

    // Assert
    const finalState = store.use(s => s);
    expect(finalState.count).toBe(1);
    expect(finalState.message).toBe('world');
  });

  it('should support effects that run during initialization', () => {
    // Arrange
    const initialState = { count: 0, initialized: false };
    const store = createStore(initialState)
      .action('increment', state => ({ count: state.count + 1 }))
      .effect('initialize', (_, helpers) => {
        helpers.set({ initialized: true });
      })
      .build();

    // Act
    const state = store.use(s => s);
    const { increment } = store();
    increment();

    // Assert
    expect(state.initialized).toBe(true);
    expect(state.count).toBe(0);
    expect(store.use(s => s.count)).toBe(1);
  });
});
