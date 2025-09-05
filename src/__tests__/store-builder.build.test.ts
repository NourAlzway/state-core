/**
 * @jest-environment node
 */

import { StoreBuilderImpl } from '../core/store-builder';

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

describe('store-builder - build methods', () => {
  it('should return a hook function', () => {
    // Arrange
    const initialState = { count: 0 };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const hook = builder.asHook();

    // Assert
    expect(typeof hook).toBe('function');
  });

  it('should create hook that returns state and actions', () => {
    // Arrange
    const initialState = { count: 0 };
    const builder = new StoreBuilderImpl(initialState).action(
      'increment',
      (state: typeof initialState) => ({ count: state.count + 1 })
    );

    // Act
    const hook = builder.asHook();

    // Assert
    expect(typeof hook).toBe('function');
  });

  it('should return callable store', () => {
    // Arrange
    const initialState = { count: 0 };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const store = builder.build();

    // Assert
    expect(typeof store).toBe('function');
    expect(typeof store.use).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('should build store with all configured actions and effects', () => {
    // Arrange
    const initialState = { count: 0, message: 'init', ready: false };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const store = builder
      .action('increment', (state: typeof initialState) => ({
        count: state.count + 1,
      }))
      .asyncAction('fetchData', async (): Promise<string> => 'async data')
      .effect('setReady', (_state, helpers): void => {
        helpers.set({ ready: true });
      })
      .build();

    // Assert
    const storeInstance = store();

    expect(typeof storeInstance.increment).toBe('function');
    expect(typeof storeInstance.fetchData).toBe('function');
    expect(typeof (storeInstance as any).setReady).toBe('function');
    expect(storeInstance.ready).toBe(true);
  });
});
