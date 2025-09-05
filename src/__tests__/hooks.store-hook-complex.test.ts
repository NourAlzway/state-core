/**
 * @jest-environment node
 */

const mockUseSyncExternalStore = jest.fn();

jest.mock('react', () => ({
  useSyncExternalStore: mockUseSyncExternalStore,
}));

import { createStoreHook } from '../core/store-hook';
import { createStoreInternal } from '../core/store-internal';
import { createAction } from '../core/action-handler';

describe('hooks - createStoreHook complex scenarios', () => {
  beforeEach(() => {
    mockUseSyncExternalStore.mockClear();
  });

  it('should handle multiple actions in hook result', () => {
    // Arrange
    const initialState = { x: 0, y: 0, name: 'origin' };
    const store = createStoreInternal(initialState);

    // Act
    store.actions.moveX = createAction(
      store,
      'moveX',
      (state: typeof initialState, ...args: any[]) => ({
        x: state.x + (args[0] as number),
      })
    );

    store.actions.moveY = createAction(
      store,
      'moveY',
      (state: typeof initialState, ...args: any[]) => ({
        y: state.y + (args[0] as number),
      })
    );

    store.actions.setName = createAction(
      store,
      'setName',
      (state: typeof initialState, ...args: any[]) => ({
        name: args[0] as string,
      })
    );

    store.actions.reset = createAction(store, 'reset', () => ({
      x: 0,
      y: 0,
      name: 'origin',
    }));

    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    const useStoreHook = createStoreHook<
      typeof initialState,
      {
        moveX: (...args: any[]) => void;
        moveY: (...args: any[]) => void;
        setName: (name: string) => void;
        reset: () => void;
      }
    >(store);
    const result = useStoreHook();

    // Assert
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.name).toBe('origin');
    expect(typeof result.moveX).toBe('function');
    expect(typeof result.moveY).toBe('function');
    expect(typeof result.setName).toBe('function');
    expect(typeof result.reset).toBe('function');

    result.moveX(5);
    result.moveY(3);
    result.setName('point');

    const newResult = useStoreHook();
    expect(newResult.x).toBe(5);
    expect(newResult.y).toBe(3);
    expect(newResult.name).toBe('point');
  });

  it('should handle empty actions object', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);

    // Act
    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    const useStoreHook = createStoreHook(store);
    const result = useStoreHook();

    // Assert
    expect(result.count).toBe(0);
    expect(
      Object.keys(result).filter(
        key => typeof result[key as keyof typeof result] === 'function'
      )
    ).toHaveLength(0);
  });

  it('should handle complex state structures', () => {
    // Arrange
    const initialState = {
      user: { id: 1, profile: { name: 'John', settings: { theme: 'dark' } } },
      posts: [{ id: 1, title: 'Hello' }],
      metadata: { version: '1.0', lastLogin: new Date() },
    };
    const store = createStoreInternal(initialState);

    // Act
    store.actions.updateTheme = createAction(
      store,
      'updateTheme',
      (state: typeof initialState, ...args: any[]) => ({
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            settings: {
              ...state.user.profile.settings,
              theme: args[0] as string,
            },
          },
        },
      })
    );

    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      return getSnapshot();
    });

    const useStoreHook = createStoreHook<
      typeof initialState,
      { updateTheme: (...args: any[]) => void }
    >(store);
    const result = useStoreHook();

    // Assert
    expect(result.user.profile.name).toBe('John');
    expect(result.user.profile.settings.theme).toBe('dark');
    expect(result.posts).toHaveLength(1);
    expect(typeof result.updateTheme).toBe('function');

    result.updateTheme('light');
    const newResult = useStoreHook();
    expect(newResult.user.profile.settings.theme).toBe('light');
  });
});
