---
description: 對指定目錄執行 code quality checks
allowed-tools: Read, Glob, Grep, Bash(npm:*), Bash(npx:*)
---

# Code Quality Review

Review 此目錄的 code quality：$ARGUMENTS

## 指示

1. **找出要 review 的 files**：
   - 找出目錄內所有 `.ts` 與 `.tsx` files
   - 排除 test files 與 generated files

2. **執行 automated checks**：
   ```bash
   npm run lint -- $ARGUMENTS
   npm run typecheck
   ```

3. **Manual review checklist**：
   - [ ] 沒有 TypeScript `any` types
   - [ ] 有適當 error handling
   - [ ] Loading states 處理正確
   - [ ] Lists 有 empty states
   - [ ] Mutations 有 onError handlers
   - [ ] Async operations 期間 buttons 會 disabled

4. 依 severity **回報 findings**：
   - Critical（一定要修）
   - Warning（應該修）
   - Suggestion（可改善）
