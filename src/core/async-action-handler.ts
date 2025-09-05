import {
  AsyncActionFn,
  AsyncState,
  StoreInternal,
  ValidStateType,
  ValidActionArgs,
} from '../types';

// Initialize async state structure
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

  const extendedState = Object.assign({}, currentState, { [name]: asyncState });
  store.setState(extendedState);
}

// Check if property is AsyncState
function isAsyncState<R>(
  obj: unknown,
  key: string
): obj is Record<string, AsyncState<R>> {
  if (!obj || typeof obj !== 'object' || obj === null) {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    return false;
  }

  const record = obj as Record<string, unknown>;
  const asyncState = record[key];

  return (
    asyncState !== null &&
    typeof asyncState === 'object' &&
    asyncState !== null &&
    Object.prototype.hasOwnProperty.call(asyncState, 'loading') &&
    Object.prototype.hasOwnProperty.call(asyncState, 'error') &&
    Object.prototype.hasOwnProperty.call(asyncState, 'data')
  );
}

/**
 * Safely get async state from store state
 */
function getAsyncState<R>(state: unknown, name: string): AsyncState<R> | null {
  if (isAsyncState<R>(state, name)) {
    return state[name] || null;
  }
  return null;
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
      const existingAsyncState = getAsyncState<R>(currentState, name);

      const loadingState = Object.assign({}, currentState, {
        [name]: {
          loading: true,
          error: null,
          data: existingAsyncState?.data || null,
        },
      });
      store.setState(loadingState);

      // Execute the async function
      const result = await fn(store.getState(), ...args);

      // Set success state
      const finalState = store.getState();
      const successState = Object.assign({}, finalState, {
        [name]: { loading: false, error: null, data: result },
      });
      store.setState(successState);
    } catch (error) {
      // Set error state
      const errorState = store.getState();
      const existingErrorState = getAsyncState<R>(errorState, name);
      const finalError =
        error instanceof Error ? error : new Error(String(error));

      const finalErrorState = Object.assign({}, errorState, {
        [name]: {
          loading: false,
          error: finalError,
          data: existingErrorState?.data || null,
        },
      });
      store.setState(finalErrorState);

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
