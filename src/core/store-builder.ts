import {
  StoreBuilder,
  StoreInternal,
  CallableStore,
  ActionFn,
  EffectFn,
  AsyncActionFn,
  AsyncState,
  StoreConfig,
  ValidStateType,
  ValidActionArgs,
} from '../types';
import { createStoreInternal } from './store-internal';
import { createAction } from './action-handler';
import {
  createAsyncAction,
  initializeAsyncState,
} from './async-action-handler';
import { executeEffect } from './effect-handler';
import { createCallableStore } from './callable-store';
import { createStoreHook } from './store-hook';

/**
 * Concrete implementation of the store builder with fluent API methods
 */
export class StoreBuilderImpl<
  T extends ValidStateType,
  Actions = Record<string, never>,
> implements StoreBuilder<T, Actions>
{
  private store: StoreInternal<T>;

  constructor(initialState: T, config: StoreConfig = {}) {
    this.store = createStoreInternal(initialState, config);
  }

  action<K extends string, Args extends ValidActionArgs>(
    name: K,
    fn: ActionFn<T, Args>
  ): StoreBuilder<T, Actions & Record<K, (...args: Args) => void>> {
    const actionFn = createAction(this.store, name, fn);
    this.store.actions[name] = actionFn as (...args: ValidActionArgs) => void;
    return this as unknown as StoreBuilder<
      T,
      Actions & Record<K, (...args: Args) => void>
    >;
  }

  asyncAction<K extends string, Args extends ValidActionArgs, R>(
    name: K,
    fn: AsyncActionFn<T, Args, R>
  ): StoreBuilder<
    T & Record<K, AsyncState<R>>,
    Actions & Record<K, (...args: Args) => Promise<void>>
  > {
    // Initialize the async state in the store
    initializeAsyncState<T, R>(this.store, name);

    // Create the async action function
    const asyncActionFn = createAsyncAction(this.store, name, fn);
    this.store.actions[name] = asyncActionFn as (
      ...args: ValidActionArgs
    ) => Promise<void>;

    return this as unknown as StoreBuilder<
      T & Record<K, AsyncState<R>>,
      Actions & Record<K, (...args: Args) => Promise<void>>
    >;
  }

  effect<K extends string>(name: K, fn: EffectFn<T>): StoreBuilder<T, Actions> {
    this.store.effects[name] = fn;
    executeEffect(this.store, name, fn);
    return this;
  }

  asHook(): () => T & Actions {
    return createStoreHook<T, Actions>(this.store);
  }

  build(): CallableStore<T, Actions> {
    return createCallableStore<T, Actions>(this.store);
  }
}
