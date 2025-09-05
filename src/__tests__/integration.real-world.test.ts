/**
 * @jest-environment node
 */

import { createStore } from '../store';

// Mock React's useSyncExternalStore for integration tests
jest.mock('react', () => ({
  useSyncExternalStore: jest.fn((subscribe, getSnapshot) => getSnapshot()),
}));

describe('integration - real world scenarios', () => {
  it('should handle a todo application scenario', async () => {
    // Arrange
    interface Todo {
      id: number;
      text: string;
      completed: boolean;
      createdAt: Date;
    }

    const initialState = {
      todos: [] as Todo[],
      filter: 'all' as 'all' | 'active' | 'completed',
      nextId: 1,
      stats: { total: 0, completed: 0, active: 0 },
      lastSaved: null as string | null,
      savedCount: 0,
    };

    // Act
    const todoStore = createStore(initialState)
      .action('addTodo', (state, text: string) => {
        const todo: Todo = {
          id: state.nextId,
          text,
          completed: false,
          createdAt: new Date(),
        };
        return {
          todos: [...state.todos, todo],
          nextId: state.nextId + 1,
        };
      })
      .action('toggleTodo', (state, id: number) => ({
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
      }))
      .action('removeTodo', (state, id: number) => ({
        todos: state.todos.filter(todo => todo.id !== id),
      }))
      .action('setFilter', (state, filter: 'all' | 'active' | 'completed') => ({
        filter,
      }))
      .action('clearCompleted', state => ({
        todos: state.todos.filter(todo => !todo.completed),
      }))
      .action('markSaved', state => ({
        lastSaved: new Date().toISOString(),
        savedCount: state.todos.length,
      }))
      .action('updateStats', state => {
        const total = state.todos.length;
        const completed = state.todos.filter(t => t.completed).length;
        const active = total - completed;
        return { stats: { total, completed, active } };
      })
      .build();

    const {
      addTodo,
      toggleTodo,
      setFilter,
      clearCompleted,
      markSaved,
      updateStats,
    } = todoStore();

    addTodo('Learn TypeScript');
    addTodo('Write tests');
    addTodo('Build app');

    // Assert
    let state = todoStore.use(s => s);
    expect(state.todos).toHaveLength(3);
    expect(state.nextId).toBe(4);

    updateStats();
    // Assert
    state = todoStore.use(s => s);
    expect(state.stats.total).toBe(3);
    expect(state.stats.active).toBe(3);
    expect(state.stats.completed).toBe(0);

    toggleTodo(1);
    toggleTodo(2);

    // Assert
    state = todoStore.use(s => s);
    expect(state.todos[0].completed).toBe(true);
    expect(state.todos[1].completed).toBe(true);

    updateStats();
    // Assert
    state = todoStore.use(s => s);
    expect(state.stats.completed).toBe(2);
    expect(state.stats.active).toBe(1);

    setFilter('completed');
    // Assert
    state = todoStore.use(s => s);
    expect(state.filter).toBe('completed');

    clearCompleted();
    state = todoStore.use(s => s);
    expect(state.todos).toHaveLength(1);
    expect(state.todos[0].text).toBe('Build app');

    markSaved();
    state = todoStore.use(s => s);
    expect(state.savedCount).toBe(1);
    expect(state.lastSaved).toBeTruthy();

    // Assert
    expect(state).toHaveProperty('todos');
    expect(state).toHaveProperty('filter');
    expect(state).toHaveProperty('nextId');
    expect(state).toHaveProperty('stats');
    expect(state).toHaveProperty('lastSaved');
    expect(state).toHaveProperty('savedCount');
    expect(typeof addTodo).toBe('function');
    expect(typeof toggleTodo).toBe('function');
    expect(typeof markSaved).toBe('function');
  });

  it('should handle user authentication flow', () => {
    // Arrange
    interface User {
      id: number;
      email: string;
      name: string;
      role: 'user' | 'admin';
    }

    const initialState = {
      user: null as User | null,
      isAuthenticated: false,
      sessionToken: null as string | null,
      loginAttempts: 0,
      lastLoginError: null as string | null,
    };

    // Act
    const authStore = createStore(initialState)
      .action('loginSuccess', (state, email: string, password: string) => {
        if (email === 'test@example.com' && password === 'password') {
          return {
            user: {
              id: 1,
              email,
              name: 'Test User',
              role: 'user' as const,
            },
            isAuthenticated: true,
            sessionToken: 'jwt-token-123',
            lastLoginError: null,
          };
        }
        return {
          loginAttempts: state.loginAttempts + 1,
          lastLoginError: 'Invalid credentials',
          isAuthenticated: false,
        };
      })
      .action('logout', () => ({
        user: null,
        isAuthenticated: false,
        sessionToken: null,
        loginAttempts: 0,
        lastLoginError: null,
      }))
      .build();

    const { loginSuccess, logout } = authStore();

    loginSuccess('test@example.com', 'password');

    // Assert
    let state = authStore.use(s => s);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    });
    expect(state.sessionToken).toBe('jwt-token-123');

    logout();
    state = authStore.use(s => s);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.sessionToken).toBe(null);

    loginSuccess('wrong@email.com', 'wrongpass');
    state = authStore.use(s => s);
    expect(state.loginAttempts).toBe(1);
    expect(state.lastLoginError).toBe('Invalid credentials');
    expect(state.isAuthenticated).toBe(false);

    expect(typeof loginSuccess).toBe('function');
    expect(typeof logout).toBe('function');
  });

  it('should handle shopping cart with complex state updates', () => {
    // Arrange
    interface CartItem {
      id: number;
      name: string;
      price: number;
      quantity: number;
    }

    const initialState = {
      items: [] as CartItem[],
      total: 0,
      itemCount: 0,
      discounts: { percentage: 0, amount: 0 },
      tax: 0,
      finalTotal: 0,
    };

    // Act
    const cartStore = createStore(initialState)
      .action('addItem', (state, item: Omit<CartItem, 'quantity'>) => {
        const existingItem = state.items.find(i => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return {
          items: [...state.items, { ...item, quantity: 1 }],
        };
      })
      .action('removeItem', (state, id: number) => ({
        items: state.items.filter(item => item.id !== id),
      }))
      .action('updateQuantity', (state, id: number, quantity: number) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.id !== id) };
        }
        return {
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        };
      })
      .action('applyDiscount', (state, percentage: number) => ({
        discounts: { ...state.discounts, percentage },
      }))
      .action('clearCart', () => ({
        items: [],
        total: 0,
        itemCount: 0,
        discounts: { percentage: 0, amount: 0 },
        tax: 0,
        finalTotal: 0,
      }))
      .action('calculateTotals', state => {
        const items = state.items;
        const subtotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const discountAmount = subtotal * (state.discounts.percentage / 100);
        const afterDiscount = subtotal - discountAmount;
        const tax = afterDiscount * 0.08;
        const finalTotal = afterDiscount + tax;

        return {
          total: subtotal,
          itemCount,
          discounts: { ...state.discounts, amount: discountAmount },
          tax,
          finalTotal,
        };
      })
      .build();

    const {
      addItem,
      removeItem,
      updateQuantity,
      applyDiscount,
      clearCart,
      calculateTotals,
    } = cartStore();

    addItem({ id: 1, name: 'Widget A', price: 10.0 });
    addItem({ id: 2, name: 'Widget B', price: 15.0 });
    addItem({ id: 1, name: 'Widget A', price: 10.0 });

    // Assert
    let state = cartStore.use(s => s);
    expect(state.items).toHaveLength(2);
    expect(state.items[0].quantity).toBe(2);

    calculateTotals();
    // Assert
    state = cartStore.use(s => s);
    expect(state.total).toBe(35.0);
    expect(state.itemCount).toBe(3);
    expect(state.tax).toBeCloseTo(2.8);
    expect(state.finalTotal).toBeCloseTo(37.8);

    applyDiscount(20);
    calculateTotals();
    state = cartStore.use(s => s);
    expect(state.discounts.percentage).toBe(20);
    expect(state.discounts.amount).toBe(7.0);
    expect(state.finalTotal).toBeCloseTo(30.24);

    updateQuantity(1, 3);
    calculateTotals();
    state = cartStore.use(s => s);
    expect(state.items[0].quantity).toBe(3);
    expect(state.total).toBe(45.0);

    removeItem(2);
    calculateTotals();
    state = cartStore.use(s => s);
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(30.0);

    clearCart();
    state = cartStore.use(s => s);
    expect(state.items).toHaveLength(0);
    expect(state.total).toBe(0);
    expect(state.finalTotal).toBe(0);

    expect(typeof addItem).toBe('function');
    expect(typeof removeItem).toBe('function');
    expect(typeof updateQuantity).toBe('function');
    expect(typeof applyDiscount).toBe('function');
    expect(typeof clearCart).toBe('function');
  });
});
