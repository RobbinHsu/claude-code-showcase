# 專案名稱

> 這是一份 CLAUDE.md 範例，示範如何為你的專案設定 Claude Code。

## 快速資訊

- **技術棧**：React、TypeScript、Node.js
- **測試指令**：`npm test`
- **Lint 指令**：`npm run lint`
- **Build 指令**：`npm run build`

## 主要目錄

- `src/components/` - React components
- `src/hooks/` - 自訂 React hooks
- `src/utils/` - Utility functions
- `src/api/` - API client code
- `tests/` - Test files

## 程式碼風格

- 啟用 TypeScript strict mode
- 優先使用 `interface` 而非 `type`（union/intersection 除外）
- 不使用 `any`，改用 `unknown`
- 使用 early return，避免巢狀 conditional
- 優先 composition，而非 inheritance

## Git 慣例

- **Branch 命名**：`{initials}/{description}`（例如 `jd/fix-login`）
- **Commit 格式**：Conventional Commits（`feat:`、`fix:`、`docs:` 等）
- **PR 標題**：與 commit 格式相同

## 關鍵規則

### 錯誤處理
- 絕對不要默默吞掉錯誤
- 發生錯誤時一定要提供使用者 feedback
- 記錄錯誤以供 debugging

### UI 狀態
- 一定要處理 loading、error、empty、success 狀態
- 只有在沒有資料時才顯示 loading
- 每個 list 都需要 empty state

### Mutations
- async operation 執行期間停用按鈕
- 按鈕要顯示 loading indicator
- 一定要有附帶 user feedback 的 onError handler

## 測試

- 先寫會失敗的測試（TDD）
- 使用 factory pattern：`getMockX(overrides)`
- 測試行為，而不是實作細節
- commit 前執行 tests

## Skill 啟用

實作任何 task 前，先檢查是否有相關 skills：

- 建立 tests → `testing-patterns` skill
- 建立 forms → `formik-patterns` skill
- GraphQL operations → `graphql-schema` skill
- Debugging issues → `systematic-debugging` skill
- UI components → `react-ui-patterns` skill

## 常用指令

```bash
# Development
npm run dev          # 啟動 dev server
npm test             # 執行 tests
npm run lint         # 執行 linter
npm run typecheck    # 檢查 types

# Git
npm run commit       # Interactive commit
gh pr create         # 建立 PR
```
