import {
  EffectFn,
  EffectHelpers,
  StoreInternal,
  ValidStateType,
} from '../types';

/**
 * Creates helper functions that effects can use to interact with the store
 */
export function createEffectHelpers<T extends ValidStateType>(
  store: StoreInternal<T>
): EffectHelpers<T> {
  return {
    set: (newState: Partial<T> | T): void => {
      store.setState(newState);
    },
    get: (): T => store.getState(),
  };
}

/**
 * Runs an effect immediately with proper error handling
 */
export function executeEffect<T extends ValidStateType>(
  store: StoreInternal<T>,
  name: string,
  fn: EffectFn<T>
): void {
  const helpers = createEffectHelpers(store);

  try {
    const result = fn(store.getState(), helpers);
    if (result instanceof Promise) {
      result.catch((error: unknown) => {
        const finalError =
          error instanceof Error ? error : new Error(String(error));

        // Use configurable error handler
        if (store.config.errorHandler) {
          store.config.errorHandler(finalError, `Effect ${name} (async)`);
        } else {
          // eslint-disable-next-line no-console
          console.error(`Effect ${name} failed:`, finalError);
        }
      });
    }
  } catch (error) {
    const finalError =
      error instanceof Error ? error : new Error(String(error));

    // Use configurable error handler
    if (store.config.errorHandler) {
      store.config.errorHandler(finalError, `Effect ${name}`);
    } else {
      // eslint-disable-next-line no-console
      console.error(`Effect ${name} failed:`, finalError);
    }
  }
}

/**
 * Creates a bound effect function that can be called from the store interface
 */
export function createBoundEffect<T extends ValidStateType>(
  store: StoreInternal<T>,
  name: string,
  effect: EffectFn<T>
): (...args: unknown[]) => void {
  return (...args: unknown[]): void => {
    const helpers = createEffectHelpers(store);

    try {
      const result = (
        effect as (
          state: T,
          helpers: EffectHelpers<T>,
          ...args: unknown[]
        ) => void | Promise<void>
      )(store.getState(), helpers, ...args);
      if (result instanceof Promise) {
        result.catch((error: unknown) => {
          const finalError =
            error instanceof Error ? error : new Error(String(error));

          // Use configurable error handler
          if (store.config.errorHandler) {
            store.config.errorHandler(finalError, `Effect ${name} (async)`);
          } else {
            // eslint-disable-next-line no-console
            console.error(`Effect ${name} failed:`, finalError);
          }
        });
      }
    } catch (error) {
      const finalError =
        error instanceof Error ? error : new Error(String(error));

      // Use configurable error handler
      if (store.config.errorHandler) {
        store.config.errorHandler(finalError, `Effect ${name} (build)`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Effect ${name} failed:`, finalError);
      }
    }
  };
}
