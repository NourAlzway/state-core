import {
  AsyncActionFn,
  AsyncState,
  StoreInternal,
  ValidStateType,
  ValidActionArgs,
} from '../types';

/**
 * Sets up the initial async state structure for an async action
 */
export function initializeAsyncState<T extends ValidStateType, R>(
  store: StoreInternal<T>,
  name: string
): void {
  const currentState = store.getState();
  const asyncState: AsyncState<R> = {
    loading: false,
    error: null,
    data: null,
  };

  // Update the store state to include the async state
  store.setState({
    ...currentState,
    [name]: asyncState,
  } as T & Record<string, AsyncState<R>>);
}

/**
 * Creates and executes an async action with automatic loading and error state management
 */
export function createAsyncAction<
  T extends ValidStateType,
  Args extends ValidActionArgs,
  R,
>(
  store: StoreInternal<T>,
  name: string,
  fn: AsyncActionFn<T, Args, R>
): (...args: Args) => Promise<void> {
  return async (...args: Args) => {
    try {
      // Set loading state
      const currentState = store.getState();
      store.setState({
        ...currentState,
        [name]: {
          loading: true,
          error: null,
          data:
            (currentState as Record<string, AsyncState<R>>)[name]?.data || null,
        },
      } as T & Record<string, AsyncState<R>>);

      // Execute the async function
      const result = await fn(store.getState(), ...args);

      // Set success state
      const finalState = store.getState();
      store.setState({
        ...finalState,
        [name]: { loading: false, error: null, data: result },
      } as T & Record<string, AsyncState<R>>);
    } catch (error) {
      // Set error state
      const errorState = store.getState();
      const finalError =
        error instanceof Error ? error : new Error(String(error));

      store.setState({
        ...errorState,
        [name]: {
          loading: false,
          error: finalError,
          data:
            (errorState as Record<string, AsyncState<R>>)[name]?.data || null,
        },
      } as T & Record<string, AsyncState<R>>);

      // Use configurable error handler
      if (store.config.errorHandler) {
        store.config.errorHandler(finalError, `AsyncAction ${name}`, args);
      } else {
        // eslint-disable-next-line no-console
        console.error(`AsyncAction ${name} failed:`, finalError);
      }
    }
  };
}
