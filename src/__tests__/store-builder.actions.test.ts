/**
 * @jest-environment node
 */

import { StoreBuilderImpl } from '../core/store-builder';
import { ActionFn } from '../types';

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

describe('store-builder - actions', () => {
  it('should add action to builder and return new builder', () => {
    // Arrange
    const initialState = { count: 0 };
    const builder = new StoreBuilderImpl(initialState);
    const incrementAction: ActionFn<typeof initialState, [number]> = (
      state,
      increment
    ) => ({
      count: state.count + increment,
    });

    // Act
    const newBuilder = builder.action('increment', incrementAction);

    // Assert
    expect(newBuilder).toBeInstanceOf(StoreBuilderImpl);
    expect(newBuilder).toBe(builder);
  });

  it('should create working action in built store', () => {
    // Arrange
    const initialState = { count: 0 };
    const builder = new StoreBuilderImpl(initialState);
    const incrementAction: ActionFn<typeof initialState, [number]> = (
      state,
      increment
    ) => ({
      count: state.count + increment,
    });
    const store = builder.action('increment', incrementAction).build();

    // Act
    const { increment } = store();
    increment(5);

    // Assert
    const state = store.use(s => s);
    expect(state.count).toBe(5);
  });

  it('should allow chaining multiple actions', () => {
    // Arrange
    const initialState = { count: 0, multiplier: 1 };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const store = builder
      .action('increment', (state: typeof initialState, amount: number) => ({
        count: state.count + amount,
      }))
      .action(
        'setMultiplier',
        (_state: typeof initialState, multiplier: number) => ({
          multiplier,
        })
      )
      .action('reset', () => ({ count: 0, multiplier: 1 }))
      .build();

    const { increment, setMultiplier, reset } = store();

    increment(5);
    setMultiplier(2);

    // Assert
    let state = store.use(s => ({ count: s.count, multiplier: s.multiplier }));
    expect(state).toEqual({ count: 5, multiplier: 2 });

    reset();
    state = store.use(s => ({ count: s.count, multiplier: s.multiplier }));
    expect(state).toEqual({ count: 0, multiplier: 1 });

    expect(typeof increment).toBe('function');
    expect(typeof setMultiplier).toBe('function');
    expect(typeof reset).toBe('function');
  });

  it('should handle actions with no parameters', () => {
    // Arrange
    const initialState = { count: 0 };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const store = builder
      .action('increment', (state: typeof initialState) => ({
        count: state.count + 1,
      }))
      .build();

    const { increment } = store();
    increment();

    // Assert
    const state = store.use(s => s);
    expect(state.count).toBe(1);
  });

  it('should handle actions with multiple parameters', () => {
    // Arrange
    const initialState = { x: 0, y: 0, name: 'origin' };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const store = builder
      .action(
        'setPosition',
        (_state: typeof initialState, x: number, y: number, name: string) => ({
          x,
          y,
          name,
        })
      )
      .build();

    const { setPosition } = store();
    setPosition(10, 20, 'point');

    // Assert
    const state = store.use(s => ({ x: s.x, y: s.y, name: s.name }));
    expect(state).toEqual({ x: 10, y: 20, name: 'point' });
  });

  it('should maintain proper type safety through chaining', () => {
    // Arrange
    const store = new StoreBuilderImpl({ count: 0 })
      .action('increment', (state: { count: number }) => ({
        count: state.count + 1,
      }))
      .action('decrement', (state: { count: number }) => ({
        count: state.count - 1,
      }))
      .action('reset', () => ({ count: 0 }))
      .build();

    const { increment, decrement, reset } = store();

    increment();
    increment();
    decrement();

    // Assert
    let state = store.use(s => s);
    expect(state.count).toBe(1);

    reset();

    // Assert
    state = store.use(s => s);
    expect(state.count).toBe(0);

    expect(typeof increment).toBe('function');
    expect(typeof decrement).toBe('function');
    expect(typeof reset).toBe('function');
  });
});
