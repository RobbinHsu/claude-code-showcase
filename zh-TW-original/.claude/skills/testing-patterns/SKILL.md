---
name: testing-patterns
description: Jest 測試模式、factory functions、mocking strategies 與 TDD workflow。撰寫 unit tests、建立 test factories，或遵循 TDD red-green-refactor cycle 時使用。
---

# Testing Patterns 與 Utilities

## 測試哲學

**Test-Driven Development（TDD）：**
- 先寫會失敗的 test
- 實作能通過測試的最少程式碼
- Green 後再 refactor
- 沒有 failing test，就不要先寫 production code

**Behavior-Driven Testing：**
- 測試行為，不測 implementation
- 聚焦 public APIs 與 business requirements
- 避免測試 implementation details
- 使用能描述行為的 test name

**Factory Pattern：**
- 建立 `getMockX(overrides?: Partial<X>)` functions
- 提供合理 default values
- 允許 override 特定 properties
- 讓 tests 保持 DRY、好維護

## Test Utilities

### 自訂 Render Function

建立 custom render，包上 components 所需的 providers：

```typescript
// src/utils/testUtils.tsx
import { render } from '@testing-library/react-native';
import { ThemeProvider } from './theme';

export const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>{ui}</ThemeProvider>
  );
};
```

**用法：**
```typescript
import { renderWithTheme } from 'utils/testUtils';
import { screen } from '@testing-library/react-native';

it('should render component', () => {
  renderWithTheme(<MyComponent />);
  expect(screen.getByText('Hello')).toBeTruthy();
});
```

## Factory Pattern

### Component Props Factory

```typescript
import { ComponentProps } from 'react';

const getMockMyComponentProps = (
  overrides?: Partial<ComponentProps<typeof MyComponent>>
) => {
  return {
    title: 'Default Title',
    count: 0,
    onPress: jest.fn(),
    isLoading: false,
    ...overrides,
  };
};

// Usage in tests
it('should render with custom title', () => {
  const props = getMockMyComponentProps({ title: 'Custom Title' });
  renderWithTheme(<MyComponent {...props} />);
  expect(screen.getByText('Custom Title')).toBeTruthy();
});
```

### Data Factory

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const getMockUser = (overrides?: Partial<User>): User => {
  return {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    ...overrides,
  };
};

// Usage
it('should display admin badge for admin users', () => {
  const user = getMockUser({ role: 'admin' });
  renderWithTheme(<UserCard user={user} />);
  expect(screen.getByText('Admin')).toBeTruthy();
});
```

## Mocking Patterns

### Mock Modules

```typescript
// Mock entire module
jest.mock('utils/analytics');

// Mock with factory function
jest.mock('utils/analytics', () => ({
  Analytics: {
    logEvent: jest.fn(),
  },
}));

// Access mock in test
const mockLogEvent = jest.requireMock('utils/analytics').Analytics.logEvent;
```

### Mock GraphQL Hooks

```typescript
jest.mock('./GetItems.generated', () => ({
  useGetItemsQuery: jest.fn(),
}));

const mockUseGetItemsQuery = jest.requireMock(
  './GetItems.generated'
).useGetItemsQuery as jest.Mock;

// In test
mockUseGetItemsQuery.mockReturnValue({
  data: { items: [] },
  loading: false,
  error: undefined,
});
```

## Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render component with default props', () => {});
    it('should render loading state when loading', () => {});
  });

  describe('User interactions', () => {
    it('should call onPress when button is clicked', async () => {});
  });

  describe('Edge cases', () => {
    it('should handle empty data gracefully', () => {});
  });
});
```

## Query Patterns

```typescript
// Element must exist
expect(screen.getByText('Hello')).toBeTruthy();

// Element should not exist
expect(screen.queryByText('Goodbye')).toBeNull();

// Element appears asynchronously
await waitFor(() => {
  expect(screen.findByText('Loaded')).toBeTruthy();
});
```

## User Interaction Patterns

```typescript
import { fireEvent, screen } from '@testing-library/react-native';

it('should submit form on button click', async () => {
  const onSubmit = jest.fn();
  renderWithTheme(<LoginForm onSubmit={onSubmit} />);

  fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
  fireEvent.changeText(screen.getByLabelText('Password'), 'password123');
  fireEvent.press(screen.getByTestId('login-button'));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalled();
  });
});
```

## 應避免的 Anti-Patterns

### 測 Mock 行為，而非真實行為

```typescript
// Bad - testing the mock
expect(mockFetchData).toHaveBeenCalled();

// Good - testing actual behavior
expect(screen.getByText('John Doe')).toBeTruthy();
```

### 不使用 Factories

```typescript
// Bad - duplicated, inconsistent test data
it('test 1', () => {
  const user = { id: '1', name: 'John', email: 'john@test.com', role: 'user' };
});
it('test 2', () => {
  const user = { id: '2', name: 'Jane', email: 'jane@test.com' }; // Missing role!
});

// Good - reusable factory
const user = getMockUser({ name: 'Custom Name' });
```

## 最佳實務

1. props 與 data **一律使用 factory functions**
2. **測試行為，不測 implementation**
3. 使用能描述行為的 test names
4. 使用 describe blocks 組織 tests
5. tests 之間清除 mocks
6. tests 要聚焦，一個 test 測一個行為

## 執行 Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test ComponentName.test.tsx
```

## 與其他 Skills 整合

- **react-ui-patterns**：測試所有 UI states（loading、error、empty、success）
- **systematic-debugging**：修 bug 前先寫能重現 bug 的 test
