import {
  StoreBuilder,
  StoreInternal,
  CallableStore,
  StrictActionFn,
  StrictEffectFn,
  StrictAsyncActionFn,
  AsyncState,
  StoreConfig,
  ValidStateType,
  ValidActionArgs,
  SafeRecord,
  isFunction,
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
    fn: StrictActionFn<T, Args>
  ): StoreBuilder<T, Actions & SafeRecord<K, (...args: Args) => void>> {
    if (!isFunction(fn)) {
      throw new TypeError(`Action '${name}' must be a function`);
    }

    const actionFn = createAction(this.store, name, fn);

    // Type-safe assignment using mapped interface
    const typedActions = this.store.actions as SafeRecord<
      string,
      (...args: any[]) => void
    >;
    typedActions[name] = actionFn;

    // Safe type transformation using mapped types
    type NewBuilder = StoreBuilder<
      T,
      Actions & SafeRecord<K, (...args: Args) => void>
    >;
    return this as NewBuilder;
  }

  asyncAction<K extends string, Args extends ValidActionArgs, R>(
    name: K,
    fn: StrictAsyncActionFn<T, Args, R>
  ): StoreBuilder<
    T & SafeRecord<K, AsyncState<R>>,
    Actions & SafeRecord<K, (...args: Args) => Promise<void>>
  > {
    if (!isFunction(fn)) {
      throw new TypeError(`Async action '${name}' must be a function`);
    }

    // Initialize the async state in the store
    initializeAsyncState<T, R>(this.store, name);

    // Create the async action function
    const asyncActionFn = createAsyncAction(this.store, name, fn);

    // Type-safe assignment
    const typedActions = this.store.actions as SafeRecord<
      string,
      (...args: any[]) => void | Promise<void>
    >;
    typedActions[name] = asyncActionFn;

    // Safe type transformation
    type NewBuilder = StoreBuilder<
      T & SafeRecord<K, AsyncState<R>>,
      Actions & SafeRecord<K, (...args: Args) => Promise<void>>
    >;
    return this as NewBuilder;
  }

  effect<K extends string>(
    name: K,
    fn: StrictEffectFn<T>
  ): StoreBuilder<T, Actions> {
    if (!isFunction(fn)) {
      throw new TypeError(`Effect '${name}' must be a function`);
    }

    // Type-safe assignment
    const typedEffects = this.store.effects as SafeRecord<
      string,
      StrictEffectFn<T>
    >;
    typedEffects[name] = fn;

    executeEffect(this.store, name, fn);
    return this;
  }

  asHook(): () => Readonly<T> & Actions {
    return createStoreHook<T, Actions>(this.store);
  }

  build(): CallableStore<T, Actions> {
    return createCallableStore<T, Actions>(this.store);
  }
}
