export type Listener<T> = (state: T, prevState: T) => void;

export type Selector<T, R = T> = (state: T) => R;

// Improved type utilities for better type inference
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];

export type StateOnly<T> = Pick<T, NonFunctionKeys<T>>;

export type ActionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof T];

export type ActionsOnly<T> = Pick<T, ActionKeys<T>>;

/**
 * Function that can modify store state by returning partial updates or complete replacement
 *
 * **State merging behavior**: When you return a Partial<T>, the properties
 * are merged with the existing state at the top level only. Nested objects
 * are completely replaced, not deeply merged.
 *
 * @template T The store state type
 * @template Args The arguments passed to the action
 */
export type ActionFn<T, Args extends unknown[]> = (
  state: T,
  ...args: Args
) => Partial<T> | T;

export type EffectFn<T> = (
  state: T,
  helpers: EffectHelpers<T>
) => void | Promise<void>;

export type AsyncActionFn<T, Args extends unknown[], R> = (
  state: T,
  ...args: Args
) => Promise<R>;

export interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

// Strict type constraints
export type ValidStateType = Record<string, unknown>;
export type ValidActionArgs = unknown[];

// Enhanced type for actions with better constraint checking
export type StrictActionFn<
  T extends ValidStateType,
  Args extends ValidActionArgs,
> = (state: T, ...args: Args) => Partial<T> | T;

// Enhanced type for async actions
export type StrictAsyncActionFn<
  T extends ValidStateType,
  Args extends ValidActionArgs,
  R,
> = (state: T, ...args: Args) => Promise<R>;

// Type-safe effect function
export type StrictEffectFn<T extends ValidStateType> = (
  state: T,
  helpers: EffectHelpers<T>
) => void | Promise<void>;

export interface EffectHelpers<T> {
  set: (newState: Partial<T> | T) => void;
  get: () => T;
}

export type ErrorHandler = (
  error: Error,
  context: string,
  additionalInfo?: unknown
) => void;

export interface StoreConfig {
  errorHandler?: ErrorHandler;
  devMode?: boolean;
}

export interface StoreInternal<T> {
  getState: () => T;
  /**
   * Updates the store state with new values
   *
   * **State merging behavior**:
   * When you pass a Partial<T>, the properties are merged with the current state
   * at the top level only. Nested objects are completely replaced, not deeply merged.
   *
   * @example
   * ```typescript
   * // Current state: { user: { name: 'John', age: 30 }, count: 5 }
   *
   * // This will merge at the top level but replace the entire user object
   * setState({ user: { name: 'Jane' } })
   * // Result: { user: { name: 'Jane' }, count: 5 }
   * // The age property is lost because the entire user object was replaced
   *
   * // To preserve nested properties, spread them manually:
   * setState({ user: { ...currentState.user, name: 'Jane' } })
   * // Result: { user: { name: 'Jane', age: 30 }, count: 5 }
   * ```
   */
  setState: (newState: Partial<T> | T) => void;
  subscribe: (listener: Listener<T>) => () => void;
  actions: Record<string, (...args: ValidActionArgs) => void | Promise<void>>;
  effects: Record<string, EffectFn<T>>;
  config: StoreConfig;
}

// More type-safe callable store with better constraints
export type CallableStore<T, Actions = Record<string, never>> = {
  // Overloads for better type inference
  (): T & Actions;
  <R>(selector: (state: T & Actions) => R): R;

  // Utility methods with strict typing
  use: <R>(selector: (state: T & Actions) => R) => R;
  subscribe: (listener: Listener<T>) => () => void;
} & Omit<StoreInternal<T>, 'getState' | 'setState' | 'subscribe'>;

// Type-safe store internal interface with constraints
export interface TypeSafeStoreInternal<T extends ValidStateType>
  extends Omit<StoreInternal<T>, 'getState' | 'setState'> {
  getState: () => T;
  setState: (newState: Partial<T> | T) => void;
}

/**
 * Store builder interface that provides a fluent API for configuring stores
 *
 * @template T The store state type (must be a valid object type)
 * @template Actions The accumulated actions type (built progressively through chaining)
 */
export interface StoreBuilder<
  T extends ValidStateType,
  Actions = Record<string, never>,
> {
  /**
   * Adds a synchronous action to the store
   *
   * Actions receive the current state and can return partial or complete state updates.
   * State updates are merged at the top level only.
   *
   * @param name The action name (becomes available as a method on the store)
   * @param fn The function that handles the action
   * @returns StoreBuilder with the new action added to the type signature
   */
  action<K extends string, Args extends ValidActionArgs>(
    name: K,
    fn: StrictActionFn<T, Args>
  ): StoreBuilder<T, Actions & Record<K, (...args: Args) => void>>;

  /**
   * Adds an async action with automatic loading and error state management
   *
   * Creates a nested state structure at `state[name]` with the following properties:
   * - loading: boolean - indicates if the async operation is currently running
   * - error: Error | null - contains any error that occurred during execution
   * - data: R | null - holds the successful result of the async operation
   *
   * @param name The async action name
   * @param fn The async function to execute
   * @returns StoreBuilder with async state properties added to the store type
   *
   * @example
   * ```typescript
   * const store = createStore({ users: [] })
   *   .asyncAction('fetchUsers', async () => {
   *     return await api.getUsers();
   *   })
   *   .build();
   *
   * // Store state becomes: { users: [], fetchUsers: { loading: false, error: null, data: null } }
   *
   * const { fetchUsers } = store();
   * await fetchUsers(); // Automatically updates loading/error states
   * ```
   */
  asyncAction<K extends string, Args extends unknown[], R>(
    name: K,
    fn: AsyncActionFn<T, Args, R>
  ): StoreBuilder<
    T & Record<K, AsyncState<R>>,
    Actions & Record<K, (...args: Args) => Promise<void>>
  >;

  /**
   * Adds a side effect to the store
   *
   * Effects are operations that can read and modify state but don't return values.
   * They execute immediately when added and can be asynchronous.
   *
   * @param name The effect name
   * @param fn The effect function
   */
  effect<K extends string>(name: K, fn: EffectFn<T>): StoreBuilder<T, Actions>;

  /**
   * Creates a React hook version of the store
   *
   * @returns A React hook that automatically subscribes to store changes
   */
  asHook(): () => T & Actions;

  /**
   * Creates the final callable store instance
   *
   * Returns a store that supports the destructuring pattern for accessing
   * both state and actions: `const { state, actions } = store()`
   *
   * @returns The callable store ready for use
   */
  build(): CallableStore<T, Actions>;
}

export interface StoreHook<T> {
  (): T;
  <R>(selector: Selector<T, R>): R;
}
