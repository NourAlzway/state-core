/**
 * @jest-environment node
 */

import { StoreBuilderImpl } from '../core/store-builder';
import { EffectFn } from '../types';

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

describe('store-builder - effects', () => {
  it('should add effect to builder', () => {
    // Arrange
    const initialState = { count: 0, initialized: false };
    const builder = new StoreBuilderImpl(initialState);
    const initEffect: EffectFn<typeof initialState> = (
      _state,
      helpers
    ): void => {
      helpers.set({ initialized: true });
    };

    // Act
    const newBuilder = builder.effect('init', initEffect);

    // Assert
    expect(newBuilder).toBeInstanceOf(StoreBuilderImpl);
    expect(newBuilder).toBe(builder);
  });

  it('should execute effect immediately when added', () => {
    // Arrange
    const initialState = { count: 0, initialized: false };
    const builder = new StoreBuilderImpl(initialState);
    const initEffect: EffectFn<typeof initialState> = (
      _state,
      helpers
    ): void => {
      helpers.set({ initialized: true });
    };

    // Act
    const store = builder.effect('init', initEffect).build();

    // Assert
    const state = store.use(s => s);
    expect(state.initialized).toBe(true);
  });

  it('should make effects available in built store', () => {
    // Arrange
    const initialState = { message: 'initial' };
    const builder = new StoreBuilderImpl(initialState);
    const logEffect: EffectFn<typeof initialState> = (
      _state,
      helpers,
      ...args: unknown[]
    ): void => {
      const [newMessage] = args as [string];
      helpers.set({ message: newMessage });
    };

    // Act
    const store = builder.effect('log', logEffect).build();
    const storeInstance = store();

    // Assert
    expect(typeof (storeInstance as any).log).toBe('function');

    (storeInstance as any).log('updated');

    // Assert
    const state = store.use(s => s);
    expect(state.message).toBe('updated');
  });

  it('should handle async effects', async () => {
    // Arrange
    const initialState = { asyncCompleted: false };
    const builder = new StoreBuilderImpl(initialState);

    let resolvePromise: () => void;
    const asyncEffect: EffectFn<typeof initialState> = async (
      _state,
      helpers
    ): Promise<void> => {
      await new Promise<void>(resolve => {
        resolvePromise = resolve;
      });
      helpers.set({ asyncCompleted: true });
    };

    // Act
    builder.effect('asyncInit', asyncEffect);

    // Act
    resolvePromise!();
    await new Promise(resolve => setTimeout(resolve, 0));

    // Act
    const store = builder.build();

    // Assert
    const state = store.use(s => s);
    expect(state.asyncCompleted).toBe(true);
  });

  it('should allow chaining effects with actions', () => {
    // Arrange
    const initialState = { count: 0, doubled: 0 };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const store = builder
      .action('increment', (state: typeof initialState) => ({
        count: state.count + 1,
      }))
      .effect('autoDouble', (state, helpers): void => {
        helpers.set({ doubled: state.count * 2 });
      })
      .build();

    // Assert
    let state = store.use(s => s);
    expect(state.doubled).toBe(0);

    // Act
    const { increment } = store();
    increment();

    // Assert
    state = store.use(s => s);
    expect(state.count).toBe(1);
    expect(state.doubled).toBe(0);
  });
});
