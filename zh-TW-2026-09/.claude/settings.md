# Claude Code Settings（2026-09）

這份設定採用目前 Claude Code 的 hook / permission / cross-session 行為。

## Permissions

`.claude/settings.json` 使用 `permissions.deny` 明確禁止 Claude 讀取：
- `.env` / `.env.*`
- `secrets/**`

這類限制應放在 permission system，而不是只依賴 prompt。

## Hooks

### PreToolUse：保護 main/master

`.claude/hooks/protect-main.js` 會：
1. 從 stdin 讀取 Claude Code 傳入的 JSON。
2. 只處理 `Edit` / `Write`。
3. 取得目前 Git branch。
4. 如果是 `main` 或 `master`，回傳目前格式的 `hookSpecificOutput.permissionDecision = "deny"`。

### PostToolUse：背景驗證

`.claude/hooks/post-edit-checks.js` 以 `async: true` 背景執行，不阻塞每次 edit：
- JS/TS：`prettier --check`
- TS/TSX：`tsc --noEmit`
- test file：執行 related tests

Hook input 不再依賴舊式 `CLAUDE_TOOL_INPUT_FILE_PATH`，而是從 stdin JSON 的 `tool_input.file_path` 取得路徑。

## 為什麼移除自訂 skill-eval hook

目前 Skills 本身已具備：
- `description` / `when_to_use` 自動選擇
- `disable-model-invocation` 控制只允許 user 手動觸發
- `user-invocable` 控制 menu 顯示
- `context: fork` 在獨立 subagent context 執行
- supporting files 與 dynamic context

因此一般專案不需要再維護 keyword regex、confidence score 與 skill-rules.json。只有非常特殊的 deterministic routing 才值得自行加 router。

## Cross-session messaging

`crossSessionInbound: "hold"` 代表其他 Claude Code session 傳入的訊息先保留，不直接打斷目前工作。這項能力需 Claude Code 支援 cross-session messaging 的平台／版本。

## Worktree

平行修改時可使用：

```bash
claude --worktree feature-auth
```

預設位置是 `.claude/worktrees/<name>/`，本 repo 已將 `.claude/worktrees/` 加入 `.gitignore`。

Subagent 也可透過 frontmatter 的 `isolation: worktree` 使用獨立 worktree。

## Agent Teams

Agent Teams 是可讓多個 Claude teammate 共享 task list 與 mailbox 的較高階 orchestration；目前仍屬 experimental。適合真正能切成獨立 workstream 的任務，不適合多個 agent 同時修改同一批檔案。
