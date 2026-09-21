---
name: pr-review
description: 依專案標準 review 指定 GitHub pull request，輸出具體且可驗證的 findings。
argument-hint: "[pr-number]"
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(gh *) Bash(git *)
---

# PR Review

Review PR：$ARGUMENTS

1. 使用 `gh pr view $ARGUMENTS` 取得 metadata。
2. 使用 `gh pr diff $ARGUMENTS` 取得完整 diff。
3. 讀取 `.claude/agents/code-reviewer.md` 與 relevant skills。
4. 聚焦本 PR 真正新增或暴露的 correctness、security、regression、test gap。
5. 每個 finding 都要有具體位置、原因與最小修法。
6. 依 Critical / Warning / Suggestion 排序。
7. 沒有實質 finding 時直接說明，不要製造 nit。
8. 只有使用者明確要求時才用 `gh pr comment` 發布。
