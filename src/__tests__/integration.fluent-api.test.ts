/**
 * @jest-environment node
 */

import { createStore } from '../store';

// Mock React's useSyncExternalStore for integration tests
jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => getSnapshot()),
}));

describe('integration - fluent API', () => {
  it('should create store with actions using fluent API', () => {
    // Arrange
    const initialState = { count: 0 };

    const store = createStore(initialState)
      .action('increment', state => ({ count: state.count + 1 }))
      .action('decrement', state => ({ count: state.count - 1 }))
      .action('reset', () => ({ count: 0 }))
      .build();

    // Act
    const { increment, decrement, reset } = store();

    increment();

    // Assert
    expect(store.use(s => s.count)).toBe(1);

    increment();
    expect(store.use(s => s.count)).toBe(2);

    decrement();
    expect(store.use(s => s.count)).toBe(1);

    reset();
    expect(store.use(s => s.count)).toBe(0);

    expect(typeof increment).toBe('function');
    expect(typeof decrement).toBe('function');
    expect(typeof reset).toBe('function');
  });

  it('should create store with multiple actions', () => {
    // Arrange
    const initialState = {
      count: 0,
      users: [] as string[],
      lastAction: 'none',
    };

    const store = createStore(initialState)
      .action('increment', state => ({
        count: state.count + 1,
        lastAction: 'increment',
      }))
      .action('addUser', (state, userName: string) => ({
        users: [...state.users, userName],
        lastAction: 'addUser',
      }))
      .action('reset', () => ({ count: 0, users: [], lastAction: 'reset' }))
      .build();

    // Act
    const { increment, addUser, reset } = store();

    increment();
    addUser('John');
    addUser('Jane');

    // Assert
    let state = store.use(s => s);
    expect(state.count).toBe(1);
    expect(state.users).toEqual(['John', 'Jane']);
    expect(state.lastAction).toBe('addUser');

    reset();
    state = store.use(s => s);
    expect(state.count).toBe(0);
    expect(state.users).toEqual([]);
    expect(state.lastAction).toBe('reset');

    expect(typeof increment).toBe('function');
    expect(typeof addUser).toBe('function');
    expect(typeof reset).toBe('function');
  });

  it('should create store with effects', () => {
    // Arrange
    const initialState = {
      count: 0,
      initialized: false,
      logs: [] as string[],
    };

    const store = createStore(initialState)
      .effect('initialize', (state, helpers) => {
        helpers.set({ initialized: true });
      })
      .action('increment', state => ({ count: state.count + 1 }))
      .effect('logger', (state, helpers) => {
        helpers.set({
          logs: [...state.logs, `${new Date().toISOString()}: Initialized`],
        });
      })
      .build();

    // Act
    let state = store.use(s => s);
    expect(state.initialized).toBe(true);

    const { increment } = store();
    increment();

    // Assert
    state = store.use(s => s);
    expect(state.count).toBe(1);
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0]).toContain('Initialized');
  });

  it('should create store with mixed actions and effects', () => {
    // Arrange
    const initialState = {
      counter: 0,
      users: [] as { id: number; name: string }[],
      lastAction: 'none',
      initialized: false,
    };

    const store = createStore(initialState)
      .effect('init', (state, helpers) => {
        helpers.set({ initialized: true, lastAction: 'initialized' });
      })
      .action('increment', state => ({
        counter: state.counter + 1,
        lastAction: 'increment',
      }))
      .action('addUser', (state, user: { id: number; name: string }) => ({
        users: [...state.users, user],
        lastAction: 'addUser',
      }))
      .action(
        'batchAddUsers',
        (state, users: { id: number; name: string }[]) => ({
          users: [...state.users, ...users],
          lastAction: 'batchAddUsers',
        })
      )
      .build();

    // Act
    let state = store.use(s => s);
    expect(state.initialized).toBe(true);
    expect(state.lastAction).toBe('initialized');

    const { increment, addUser, batchAddUsers } = store();

    increment();
    addUser({ id: 1, name: 'Manual User' });

    // Assert
    state = store.use(s => s);
    expect(state.counter).toBe(1);
    expect(state.users).toHaveLength(1);
    expect(state.users[0]).toEqual({ id: 1, name: 'Manual User' });

    batchAddUsers([
      { id: 2, name: 'User Two' },
      { id: 3, name: 'User Three' },
    ]);

    // Assert
    state = store.use(s => s);
    expect(state.users).toHaveLength(3);
    expect(state.users[1]).toEqual({ id: 2, name: 'User Two' });
    expect(state.users[2]).toEqual({ id: 3, name: 'User Three' });

    expect(state.counter).toBe(1);
    expect(state.initialized).toBe(true);
    expect(state.lastAction).toBe('batchAddUsers');
  });
});
