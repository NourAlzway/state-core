export type Listener<T> = (state: Readonly<T>, prevState: Readonly<T>) => void;

export type Selector<T, R = T> = (state: Readonly<T>) => R;

export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

export type StateOnly<T> = Pick<T, NonFunctionKeys<T>>;

export type ActionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type ActionsOnly<T> = Pick<T, ActionKeys<T>>;

export const isObject = (
  value: unknown
): value is Record<PropertyKey, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const isFunction = (value: unknown): value is (...args: any[]) => any =>
  typeof value === 'function';

export const isPromise = <T = any>(value: unknown): value is Promise<T> =>
  value instanceof Promise ||
  (isObject(value) && isFunction((value as any).then));

export type SafeRecord<K extends keyof any = string, V = unknown> = Record<
  K,
  V
>;

export type ActionFn<T, Args extends ValidActionArgs> = (
  state: Readonly<T>,
  ...args: Args
) => Partial<T> | T;

export type StrictActionFn<T, Args extends ValidActionArgs> = ActionFn<T, Args>;
export type StrictAsyncActionFn<
  T,
  Args extends ValidActionArgs,
  R,
> = AsyncActionFn<T, Args, R>;
export type StrictEffectFn<T> = EffectFn<T>;

export type EffectFn<T> = (
  state: Readonly<T>,
  helpers: EffectHelpers<T>
) => void | Promise<void>;

export type AsyncActionFn<T, Args extends ValidActionArgs, R> = (
  state: Readonly<T>,
  ...args: Args
) => Promise<R>;

export interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export type ValidStateType = Record<string, unknown>;

export type ValidActionArgs = readonly unknown[];

export interface EffectHelpers<T> {
  set: (newState: Partial<T> | T) => void;
  get: () => Readonly<T>;
}

export type ErrorHandler = (
  error: Error,
  context: string,
  additionalInfo?: unknown
) => void;

export interface StoreConfig {
  readonly errorHandler?: ErrorHandler;
  readonly devMode?: boolean;
  readonly batchUpdates?: boolean;
  readonly enablePerformanceTracking?: boolean;
}

export interface StoreInternal<T extends ValidStateType> {
  getState: () => Readonly<T>;
  // Updates state - shallow merge only
  setState: (newState: Partial<T> | T) => void;
  subscribe: (listener: Listener<T>) => () => void;
  readonly actions: SafeRecord<
    string,
    (...args: ValidActionArgs) => void | Promise<void>
  >;
  readonly effects: SafeRecord<string, EffectFn<T>>;
  readonly config: Readonly<StoreConfig>;
}

export type CallableStore<
  T extends ValidStateType,
  Actions = SafeRecord<string, never>,
> = {
  (): Readonly<T> & Actions;
  <R>(selector: (state: Readonly<T> & Actions) => R): R;

  use: <R>(selector: (state: Readonly<T> & Actions) => R) => R;
  subscribe: (listener: Listener<T>) => () => void;
} & Omit<StoreInternal<T>, 'getState' | 'setState' | 'subscribe'>;

export interface StoreBuilder<
  T extends ValidStateType,
  Actions = Record<string, never>,
> {
  action<K extends string, Args extends ValidActionArgs>(
    name: K,
    fn: StrictActionFn<T, Args>
  ): StoreBuilder<T, Actions & SafeRecord<K, (...args: Args) => void>>;

  asyncAction<K extends string, Args extends ValidActionArgs, R>(
    name: K,
    fn: StrictAsyncActionFn<T, Args, R>
  ): StoreBuilder<
    T & SafeRecord<K, AsyncState<R>>,
    Actions & SafeRecord<K, (...args: Args) => Promise<void>>
  >;

  effect<K extends string>(
    name: K,
    fn: StrictEffectFn<T>
  ): StoreBuilder<T, Actions>;

  asHook(): () => Readonly<T> & Actions;

  build(): CallableStore<T, Actions>;
}

export interface StoreHook<T extends ValidStateType> {
  (): Readonly<T>;
  <R>(selector: Selector<Readonly<T>, R>): R;
}
