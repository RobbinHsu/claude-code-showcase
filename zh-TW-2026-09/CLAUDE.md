# 專案名稱

> 這是一份依 2026 年 9 月 Claude Code 能力整理的專案設定範例。

## 快速資訊

- **技術棧**：React、TypeScript、Node.js
- **測試**：`npm test`
- **Lint**：`npm run lint`
- **Build**：`npm run build`
- **Type Check**：`npm run typecheck`

## 主要目錄

- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/api/` - API client code
- `tests/` - Test files

## 程式碼規則

- TypeScript strict mode
- 優先使用 `interface`；union/intersection 才使用 `type`
- 不使用 `any`，改用 `unknown`
- 優先 early return，避免深層巢狀條件
- Composition 優於 inheritance
- 錯誤不能靜默吞掉
- UI 必須處理 loading、error、empty、success
- Async mutation 期間停用 trigger，並提供失敗 feedback

## Git / Worktree

- Branch：`{initials}/{description}`
- Commit：Conventional Commits
- 不直接修改 `main` / `master`
- 需要平行開發時，可使用 `claude --worktree <name>`；Claude Code 預設 worktree 位於 `.claude/worktrees/`

## Skills

Claude Code 會依 skill 的 `description` / `when_to_use` 自動選擇相關 skill；不需要額外維護 keyword-based skill router。

常用 skills：
- Tests → `testing-patterns`
- Forms → `formik-patterns`
- GraphQL → `graphql-schema`
- Debugging → `systematic-debugging`
- UI → `react-ui-patterns`
- Ticket → `ticket`
- PR review → `pr-review`

## Subagents

對可獨立處理、需要不同 context 或可平行執行的工作使用 subagent：
- `code-reviewer`：changes 完成後做獨立 code review
- `github-workflow`：處理 branch、commit、PR workflow

避免讓多個 agent 同時修改同一批檔案。需要隔離修改時，優先使用 `isolation: worktree`。

## 驗證

宣稱完成前至少執行：
1. `npm run lint`
2. `npm run typecheck`
3. 相關 tests
4. 檢查 `git diff`，確認沒有非預期 changes

## 安全

- 不讀取或 commit `.env`、`secrets/` 等敏感檔案
- 重大／不可逆 action 必須保留 human approval
- MCP credential 只透過 environment variables / OAuth 提供
