---
name: onboard
description: 深入理解目前 task 與相關 codebase，產生可供後續 session 使用的 onboarding 記錄。
argument-hint: "[task-context]"
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(git *)
---

# Task Onboarding

任務 context：$ARGUMENTS

1. 探索與 task 直接相關的 code、tests、configuration 與 recent changes。
2. 找出主要 entry point、data flow、dependency、constraint 與可能風險。
3. 不修改 production code。
4. 如果資訊不足，明確列出未知事項，不要猜測。
5. 把可重用的結果寫入 `.claude/tasks/<TASK_ID>/onboarding.md`；如果沒有 TASK_ID，先以清楚的 task slug 命名。
6. 記錄內容要足以讓新的 Claude Code session 快速接手，但避免複製大量原始碼。
