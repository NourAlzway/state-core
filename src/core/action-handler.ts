import {
  ActionFn,
  StoreInternal,
  ValidStateType,
  ValidActionArgs,
} from '../types';

/**
 * Creates and executes a synchronous action function
 */
export function createAction<
  T extends ValidStateType,
  Args extends ValidActionArgs,
>(
  store: StoreInternal<T>,
  name: string,
  fn: ActionFn<T, Args>
): (...args: Args) => void {
  return (...args: Args) => {
    try {
      const currentState = store.getState();

      const result = fn(currentState, ...args);
      const newState =
        typeof result === 'object' && result !== null
          ? { ...currentState, ...result }
          : result;

      store.setState(newState);
    } catch (error) {
      const finalError =
        error instanceof Error ? error : new Error(String(error));

      // Use configurable error handler
      if (store.config.errorHandler) {
        store.config.errorHandler(finalError, `Action ${name}`, args);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Action ${name} failed:`, finalError);
      }

      // Re-throw for tests that expect it
      throw finalError;
    }
  };
}
