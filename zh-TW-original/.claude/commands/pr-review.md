---
description: 使用專案標準 review pull request
allowed-tools: Read, Glob, Grep, Bash(git:*), Bash(gh:*)
---

# PR Review

Review pull request：$ARGUMENTS

## 指示

1. **取得 PR 資訊**：
   - 執行 `gh pr view $ARGUMENTS` 取得 PR details
   - 執行 `gh pr diff $ARGUMENTS` 查看 changes

2. **讀取 review 標準**：
   - 讀取 `.claude/agents/code-reviewer.md` 取得 review checklist

3. 對所有 changed files **套用 checklist**：
   - TypeScript strict mode compliance
   - Error handling patterns
   - Loading/error/empty states
   - Test coverage
   - Documentation updates

4. **提供結構化 feedback**：
   - **Critical**：merge 前一定要修
   - **Warning**：應該修
   - **Suggestion**：有會更好

5. 使用 `gh pr comment` **發布 review comments**
