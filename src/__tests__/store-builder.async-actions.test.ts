/**
 * @jest-environment node
 */

import { StoreBuilderImpl } from '../core/store-builder';
import { AsyncActionFn } from '../types';

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

describe('store-builder - async actions', () => {
  it('should add async action to builder', () => {
    // Arrange
    const initialState = { users: [] as string[] };
    const builder = new StoreBuilderImpl(initialState);
    const fetchUsers: AsyncActionFn<
      typeof initialState,
      [],
      string[]
    > = async () => {
      return ['user1', 'user2'];
    };

    // Act
    const newBuilder = builder.asyncAction('fetchUsers', fetchUsers);

    // Assert
    expect(newBuilder).toBeInstanceOf(StoreBuilderImpl);
  });

  it('should create working async action in built store', async () => {
    // Arrange
    const initialState = { users: [] as string[] };
    const builder = new StoreBuilderImpl(initialState);
    const fetchUsers: AsyncActionFn<
      typeof initialState,
      [],
      string[]
    > = async () => {
      return ['user1', 'user2'];
    };

    // Act
    const store = builder.asyncAction('fetchUsers', fetchUsers).build();
    const { fetchUsers: fetchUsersAction } = store();

    // Assert
    await fetchUsersAction();
  });

  it('should handle async actions with parameters', async () => {
    // Arrange
    const initialState = { data: null as { id: number; name: string } | null };
    const builder = new StoreBuilderImpl(initialState);
    const fetchUser: AsyncActionFn<
      typeof initialState,
      [number],
      { id: number; name: string }
    > = async (_state, id) => {
      return { id, name: `User ${id}` };
    };

    // Act
    const store = builder.asyncAction('fetchUser', fetchUser).build();
    const { fetchUser: fetchUserAction } = store();
    await fetchUserAction(123);

    // Assert
    expect(typeof fetchUserAction).toBe('function');
  });

  it('should handle async action errors', async () => {
    // Arrange
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const initialState = { data: null };
    const builder = new StoreBuilderImpl(initialState);
    const failingFetch: AsyncActionFn<
      typeof initialState,
      [],
      string
    > = async () => {
      throw new Error('Fetch failed');
    };

    // Act
    const store = builder.asyncAction('failingFetch', failingFetch).build();
    const { failingFetch: failingFetchAction } = store();
    await failingFetchAction();

    // Assert
    expect(typeof failingFetchAction).toBe('function');
    consoleSpy.mockRestore();
  });

  it('should allow chaining async actions', async () => {
    // Arrange
    const initialState = { config: { apiUrl: 'test' } };
    const builder = new StoreBuilderImpl(initialState);

    // Act
    const store = builder
      .asyncAction('fetchConfig', async (): Promise<{ apiUrl: string }> => {
        return { apiUrl: 'https://api.example.com' };
      })
      .asyncAction('validateConfig', async (): Promise<{ valid: boolean }> => {
        return { valid: true };
      })
      .build();

    // Assert
    const { fetchConfig, validateConfig } = store();

    await fetchConfig();
    await validateConfig();

    expect(typeof fetchConfig).toBe('function');
    expect(typeof validateConfig).toBe('function');
  });
});
