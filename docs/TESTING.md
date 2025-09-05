# Testing Standards
This guide outlines the testing conventions and best practices for contributing to Acacus. Follow these guidelines to maintain consistent, readable, and maintainable tests.

## File Organization

Tests are organized by functional scope with descriptive naming:

```
src/__tests__/
├── store-builder.actions.test.ts
├── callable-store.basic.test.ts  
├── hooks.use-store.test.ts
└── integration.real-world.test.ts
```

**Convention**: `{component}.{scope}.test.ts` | **Max 400 lines per file**

## Core Patterns

### Standard Structure
Follow AAA pattern with explicit sections:

```typescript
describe('component - scope', () => {
  it('should describe expected behavior', () => {
    // Arrange
    const initialState = { count: 0 };
    const store = createStoreInternal(initialState);
    
    // Act
    const result = store.someMethod();
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### React Hook Testing
Mock dependencies before imports to avoid hoisting issues:

```typescript
const mockUseSyncExternalStore = jest.fn();

jest.mock('react', () => ({
  useSyncExternalStore: mockUseSyncExternalStore,
}));

import { useStore } from '../hooks/use-store';

describe('hooks - useStore', () => {
  beforeEach(() => mockUseSyncExternalStore.mockClear());
  
  it('should use React\'s useSyncExternalStore', () => {
    const store = createStoreInternal({ count: 0 });
    mockUseSyncExternalStore.mockReturnValue({ count: 0 });
    
    const result = useStore(store);
    
    expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
      store.subscribe,
      expect.any(Function),
      expect.any(Function)
    );
  });
});
```

### Error Handling
Test error scenarios with proper mocks:

```typescript
it('should handle action errors', () => {
  const errorHandler = jest.fn();
  const store = createStoreInternal(initialState, { errorHandler });
  
  const failingAction = () => { throw new Error('Test error'); };
  executeAction(store, failingAction);
  
  expect(errorHandler).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'Test error' }),
    'Action context'
  );
});
```

### Async Operations
Use async/await patterns and test intermediate states:

```typescript
it('should handle async operations', async () => {
  const store = createStoreInternal({ data: null, loading: false });
  const asyncAction = async () => 'result';
  
  const promise = store.executeAsync(asyncAction);
  expect(store.getState().loading).toBe(true);
  
  await promise;
  expect(store.getState()).toEqual({ data: 'result', loading: false });
});
```

## Component-Specific Testing

### Store Internal
Test state updates and mutations:

```typescript
it('should merge partial state updates', () => {
  const store = createStoreInternal({ count: 0, name: 'initial' });
  store.setState({ count: 5 });
  expect(store.getState()).toEqual({ count: 5, name: 'initial' });
});
```

### Callable Store
Use `.use()` selector method for state access:

```typescript
it('should execute actions through callable interface', () => {
  const callableStore = createCallableStore(createStoreInternal({ count: 0 }));
  const { increment } = callableStore();
  
  increment(5);
  
  expect(callableStore.use(s => s.count)).toBe(5);
});
```

### Store Builder
Test fluent API construction:

```typescript
it('should build functional store with actions', () => {
  const store = new StoreBuilder({ count: 0 })
    .action('increment', (state, amount) => ({ count: state.count + amount }))
    .build();
    
  const { increment } = store();
  increment(3);
  
  expect(store.use(s => s.count)).toBe(3);
});
```

## Best Practices

### Test Names
Be specific about behavior and conditions:
```typescript
// ✅ Good
it('should return filtered items when predicate matches')
it('should handle async errors with custom handler')

// ❌ Avoid
it('tests filtering')
it('error handling')
```

### Mocking Console
Clean up console mocks properly:
```typescript
const originalWarn = console.warn;

beforeAll(() => {
  // eslint-disable-next-line no-console
  console.warn = jest.fn();
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.warn = originalWarn;
});
```

### Variable Naming
Use descriptive names that clarify intent:
```typescript
// ✅ Clear intent
const mockErrorHandler = jest.fn();
const userInitialState = { name: 'John', active: true };

// ❌ Generic
const fn = jest.fn();
const state = { name: 'John' };
```

## Development Workflow

### Running Tests
```bash
npm test                              # Watch mode
npm test -- --watchAll=false         # Single run  
npm test -- store-builder.test.ts    # Specific file
npm test -- --coverage               # With coverage
```

### Pre-commit Checklist
```bash
npm run lint && npm run typecheck && npm test -- --watchAll=false
```

### Adding Tests
1. Write tests for new functionality (TDD when possible)
2. Test both success paths and error scenarios
3. Follow existing patterns in similar test files
4. Keep files focused and under 400 lines
5. Update this guide for new testing patterns

## Environment
- **Jest** with **jsdom** environment
- **TypeScript** compilation handled automatically  
- Tests should be **deterministic** and **isolated**

---

*This guide is a living document. Please update it when you discover new patterns or better practices for our testing approach.*