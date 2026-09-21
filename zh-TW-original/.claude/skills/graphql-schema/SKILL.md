---
name: graphql-schema
description: GraphQL queries、mutations 與 code generation patterns。建立 GraphQL operations、使用 Apollo Client 或產生 types 時使用。
---

# GraphQL Schema Patterns

## 核心規則

1. **絕對不要 inline `gql` literals** - 建立 `.gql` files
2. 建立或修改 `.gql` files 後，**一定要執行 codegen**
3. Mutation **一定要加入 `onError` handler**
4. **使用 generated hooks** - 不要直接寫 raw Apollo hooks

## File Structure

```
src/
├── components/
│   └── ItemList/
│       ├── ItemList.tsx
│       ├── GetItems.gql           # Query definition
│       └── GetItems.generated.ts  # Auto-generated (don't edit)
└── graphql/
    └── mutations/
        └── CreateItem.gql         # Shared mutations
```

## 建立 Query

### Step 1：建立 .gql file

```graphql
# src/components/ItemList/GetItems.gql
query GetItems($limit: Int, $offset: Int) {
  items(limit: $limit, offset: $offset) {
    id
    name
    description
    createdAt
  }
}
```

### Step 2：執行 codegen

```bash
npm run gql:typegen
```

### Step 3：Import 並使用 generated hook

```typescript
import { useGetItemsQuery } from './GetItems.generated';

const ItemList = () => {
  const { data, loading, error, refetch } = useGetItemsQuery({
    variables: { limit: 20, offset: 0 },
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading && !data) return <LoadingSkeleton />;
  if (!data?.items.length) return <EmptyState />;

  return <List items={data.items} />;
};
```

## 建立 Mutation

### Step 1：建立 .gql file

```graphql
# src/graphql/mutations/CreateItem.gql
mutation CreateItem($input: CreateItemInput!) {
  createItem(input: $input) {
    id
    name
    description
  }
}
```

### Step 2：執行 codegen

```bash
npm run gql:typegen
```

### Step 3：使用時一定要有 error handling

```typescript
import { useCreateItemMutation } from 'graphql/mutations/CreateItem.generated';

const CreateItemForm = () => {
  const [createItem, { loading }] = useCreateItemMutation({
    // Success handling
    onCompleted: (data) => {
      toast.success({ title: 'Item created' });
      navigation.goBack();
    },
    // ERROR HANDLING IS REQUIRED
    onError: (error) => {
      console.error('createItem failed:', error);
      toast.error({ title: 'Failed to create item' });
    },
    // Cache update
    update: (cache, { data }) => {
      if (data?.createItem) {
        cache.modify({
          fields: {
            items: (existing = []) => [...existing, data.createItem],
          },
        });
      }
    },
  });

  return (
    <Button
      onPress={() => createItem({ variables: { input: formValues } })}
      isDisabled={!isValid || loading}
      isLoading={loading}
    >
      Create
    </Button>
  );
};
```

## Mutation UI Requirements

**CRITICAL：每個 mutation trigger 都必須：**

1. **Mutation 期間 disabled** - 防止 double-click
2. **顯示 loading state** - 提供視覺 feedback
3. **有 onError handler** - 讓 user 知道失敗
4. **顯示 success feedback** - 讓 user 知道成功

```typescript
// CORRECT - Complete mutation pattern
const [submit, { loading }] = useSubmitMutation({
  onError: (error) => {
    console.error('submit failed:', error);
    toast.error({ title: 'Save failed' });
  },
  onCompleted: () => {
    toast.success({ title: 'Saved' });
  },
});

<Button
  onPress={handleSubmit}
  isDisabled={!isValid || loading}
  isLoading={loading}
>
  Submit
</Button>
```

## Query Options

### Fetch Policies

| Policy | 使用時機 |
|--------|----------|
| `cache-first` | Data 很少變 |
| `cache-and-network` | 要快又要新鮮（default） |
| `network-only` | 一定要最新資料 |
| `no-cache` | 永不 cache（少見） |

### 常用 Options

```typescript
useGetItemsQuery({
  variables: { id: itemId },

  // Fetch strategy
  fetchPolicy: 'cache-and-network',

  // Re-render on network status changes
  notifyOnNetworkStatusChange: true,

  // Skip if condition not met
  skip: !itemId,

  // Poll for updates
  pollInterval: 30000,
});
```

## Optimistic Updates

用來提供即時 UI feedback：

```typescript
const [toggleFavorite] = useToggleFavoriteMutation({
  optimisticResponse: {
    toggleFavorite: {
      __typename: 'Item',
      id: itemId,
      isFavorite: !currentState,
    },
  },
  onError: (error) => {
    // Rollback happens automatically
    console.error('toggleFavorite failed:', error);
    toast.error({ title: 'Failed to update' });
  },
});
```

### 何時不要使用 Optimistic Updates

- 可能 validation fail 的 operation
- 使用 server-generated value 的 operation
- Destructive operation（delete）
- 會影響其他 users 的 operation

## Fragments

可重複使用的 field selection：

```graphql
# src/graphql/fragments/ItemFields.gql
fragment ItemFields on Item {
  id
  name
  description
  createdAt
  updatedAt
}
```

在 queries 中使用：

```graphql
query GetItems {
  items {
    ...ItemFields
  }
}
```

## Anti-Patterns

```typescript
// WRONG - Inline gql
const GET_ITEMS = gql\`
  query GetItems { items { id } }
\`;

// CORRECT - Use .gql file + generated hook
import { useGetItemsQuery } from './GetItems.generated';


// WRONG - No error handler
const [mutate] = useMutation(MUTATION);

// CORRECT - Always handle errors
const [mutate] = useMutation(MUTATION, {
  onError: (error) => {
    console.error('mutation failed:', error);
    toast.error({ title: 'Operation failed' });
  },
});


// WRONG - Button not disabled during mutation
<Button onPress={submit}>Submit</Button>

// CORRECT - Disabled and loading
<Button onPress={submit} isDisabled={loading} isLoading={loading}>
  Submit
</Button>
```

## Codegen Commands

```bash
# Generate types from .gql files
npm run gql:typegen

# Download schema + generate types
npm run sync-types
```

## 與其他 Skills 整合

- **react-ui-patterns**：Queries 的 loading/error/empty states
- **testing-patterns**：Tests 中 mock generated hooks
- **formik-patterns**：Mutation submission patterns
