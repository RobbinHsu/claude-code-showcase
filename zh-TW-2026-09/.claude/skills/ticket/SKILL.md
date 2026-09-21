---
name: ticket
description: 從 JIRA/Linear ticket 讀取需求、探索 codebase、實作、驗證並準備 PR。
argument-hint: "[ticket-id]"
disable-model-invocation: true
allowed-tools: Read Write Edit Grep Glob Bash(git *) Bash(gh *) Bash(npm *) mcp__jira__* mcp__linear__* mcp__github__*
---

# Ticket Workflow

處理 ticket：$ARGUMENTS

1. 透過可用的 JIRA/Linear MCP tool 讀取 title、description、acceptance criteria、linked issues、comments。
2. 摘要 scope、acceptance criteria、dependency 與 blocker。
3. 探索 codebase，確認現有 pattern 與需要修改的 files。
4. 建立 feature branch 或 worktree，不直接修改 main/master。
5. 依專案 skills 實作；需要時先寫 failing test。
6. 執行 lint、typecheck、相關 tests。
7. 檢查 diff，確認沒有非預期 change。
8. 使用者允許後再更新 ticket status / comment，並建立 PR。
9. 發現無關 bug 時記錄，不要擴大本 ticket scope；只有使用者允許時才建立額外 ticket。
