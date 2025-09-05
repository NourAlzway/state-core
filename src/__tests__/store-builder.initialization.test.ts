/**
 * @jest-environment node
 */

import { StoreBuilderImpl } from '../core/store-builder';
import { StoreConfig } from '../types';

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

describe('store-builder - initialization', () => {
  it('should initialize with initial state', () => {
    // Arrange
    const initialState = { count: 0, name: 'test' };

    const builder = new StoreBuilderImpl(initialState);

    // Assert
    expect(builder).toBeInstanceOf(StoreBuilderImpl);
    const store = builder.build();
    const state = store.use(s => s);

    // Assert
    expect(state).toEqual(initialState);
  });

  it('should initialize with config', () => {
    // Arrange
    const initialState = { count: 0 };
    const config: StoreConfig = {
      devMode: true,
      errorHandler: jest.fn(),
    };

    // Act
    const builder = new StoreBuilderImpl(initialState, config);
    const store = builder.build();

    // Assert
    expect(builder).toBeInstanceOf(StoreBuilderImpl);
    const state = store.use(s => s);

    // Assert
    expect(state).toEqual(initialState);
  });

  it('should initialize with empty config by default', () => {
    // Arrange
    const initialState = { count: 0 };

    // Act
    const builder = new StoreBuilderImpl(initialState);
    const store = builder.build();

    // Assert
    expect(store).toBeDefined();
    const state = store.use(s => s);
    expect(state).toEqual(initialState);
  });
});
