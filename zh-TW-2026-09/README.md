# Claude Code 專案設定展示 — 2026/09 更新版

> 這份版本以原始 `claude-code-showcase` 為基礎，依 **2026 年 9 月 Claude Code 官方文件**重新整理。重點不是把設定堆滿，而是使用 Claude Code 現在已原生支援的 Skills、Subagents、Hooks、MCP、Plugins、Worktrees 與協作能力，減少自製 orchestration。

## 這版和 2026/1 原版差在哪裡？

| 項目 | 原版做法 | 2026/09 建議 |
|---|---|---|
| Reusable workflow | `.claude/commands/*.md` | **Skills**：`.claude/skills/<name>/SKILL.md` |
| Skill routing | 自製 keyword / regex hook | 優先使用 Skill `description` + `when_to_use` |
| Skill isolation | 無 | `context: fork` + subagent |
| Agent | 基本 custom agent | tools、skills preload、memory、permission mode、background、worktree isolation、MCP scope |
| Hooks | 少數事件、舊 env 讀法 | stdin JSON、async hooks、更完整 lifecycle events |
| 平行工作 | 自行開 session | Worktrees、background subagents；必要時 Agent Teams |
| 跨 session 溝通 | 無 | Cross-session messaging（平台／版本有限制） |
| Extension packaging | 零散設定 | Plugins 可封裝 Skills、Agents、Hooks、MCP、LSP |
| GitHub Action | `anthropics/claude-code-action@beta` | `anthropics/claude-code-action@v1` |
| MCP | 多個舊 stdio package 範例 | 優先 remote HTTP / OAuth；credential 用 env |
| Model | 寫死完整舊 model ID | 一般設定優先 `inherit` 或不指定，降低過時成本 |

> 舊的 `.claude/commands/*.md` 仍相容，但官方目前建議新功能使用 Skills。

---

## 目錄

- [建議目錄結構](#建議目錄結構)
- [1. CLAUDE.md](#1-claudemd)
- [2. Skills](#2-skills)
- [3. Subagents](#3-subagents)
- [4. Hooks](#4-hooks)
- [5. MCP](#5-mcp)
- [6. LSP 與 Plugins](#6-lsp-與-plugins)
- [7. Worktrees](#7-worktrees)
- [8. Agent Teams](#8-agent-teams)
- [9. Cross-session messaging](#9-cross-session-messaging)
- [10. GitHub Actions](#10-github-actions)
- [11. 建議的實務配置](#11-建議的實務配置)
- [官方文件](#官方文件)

---

## 建議目錄結構

```text
your-project/
├── CLAUDE.md
├── .mcp.json
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   ├── settings.md
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   └── github-workflow.md
│   ├── hooks/
│   │   ├── protect-main.js
│   │   └── post-edit-checks.js
│   └── skills/
│       ├── README.md
│       ├── testing-patterns/SKILL.md
│       ├── systematic-debugging/SKILL.md
│       ├── react-ui-patterns/SKILL.md
│       ├── graphql-schema/SKILL.md
│       ├── core-components/SKILL.md
│       ├── formik-patterns/SKILL.md
│       ├── onboard/SKILL.md
│       ├── ticket/SKILL.md
│       ├── pr-review/SKILL.md
│       ├── pr-summary/SKILL.md
│       ├── code-quality/SKILL.md
│       └── docs-sync/SKILL.md
└── .github/
    └── workflows/
        ├── pr-claude-code-review.yml
        ├── scheduled-claude-code-docs-sync.yml
        ├── scheduled-claude-code-quality.yml
        └── scheduled-claude-code-dependency-audit.yml
```

原版的 `.claude/hooks/skill-eval.*`、`skill-rules.json` 與 `.claude/commands/` 在這版移除，因為目前 Skills 已能處理大部分 routing 與 workflow invocation。

---

## 1. CLAUDE.md

`CLAUDE.md` 仍是最重要的 project-level instruction。放「幾乎每個 task 都需要知道」的資訊：

- Stack / architecture
- Build、test、lint、typecheck command
- Critical coding rules
- Git / branch policy
- 驗證要求
- 安全與資料限制

不要把大型教學全部塞進 CLAUDE.md。特定 domain knowledge 放 Skills，專門角色放 Subagents。

本 repo 範例：[CLAUDE.md](CLAUDE.md)

---

## 2. Skills

Skills 現在同時負責兩類工作：

1. **Domain knowledge**：測試方式、UI pattern、GraphQL 慣例。
2. **Reusable workflow**：`/ticket`、`/pr-review`、`/docs-sync`。

### Skill 基本格式

```markdown
---
name: testing-patterns
description: 本專案的 Jest/TDD pattern。撰寫或修改 tests 時使用。
when_to_use: 使用者要求測試、TDD、mock 或 test factory 時。
---

# Testing Patterns
...
```

目前 frontmatter 全部是 optional；`description` 最值得提供。

### 手動 workflow

具有 side effect 或不應由 model 自動啟動的 workflow：

```yaml
disable-model-invocation: true
```

例如 `ticket`、`pr-review`、`docs-sync`。

### Context fork

大量 research / review 可使用：

```yaml
context: fork
agent: Explore
```

這樣 skill 在獨立 subagent context 執行，不會把大量探索結果塞進主 conversation。

### 為什麼不再需要 skill-eval.js？

現在 Claude 會看到 skill 的 `description` / `when_to_use`，需要時才載入完整 Skill。除非你的 organization 有極度 deterministic 的 routing requirement，否則不值得再維護一套 keyword、regex、score engine。

完整說明：[.claude/skills/README.md](.claude/skills/README.md)

---

## 3. Subagents

Subagent 適合：

- Code review
- 大型 research / codebase exploration
- 可以獨立驗證的工作
- 需要不同 permission / model / context 的工作
- 可平行處理、且不互相修改相同檔案的 task

### 2026/09 可用的重要能力

Agent frontmatter 已能設定：

- `tools`
- `model`（可用 `inherit`）
- `permissionMode`
- `maxTurns`
- `skills`：啟動時預載完整 Skill
- `memory`：`user` / `project` / `local`
- `background`
- `isolation: worktree`
- `hooks`
- `mcpServers`

本 repo 的 [code-reviewer](.claude/agents/code-reviewer.md) 使用：
- `model: inherit`：避免把 model ID 寫死
- project memory：累積本專案 recurring review pattern
- Skills preload：直接帶入 testing / UI / GraphQL pattern
- `permissionMode: plan`：review 為主，不主動改 code

### Foreground vs Background

長時間但不需要主流程立即結果的 subagent 可以 background 執行。需要結果才能繼續的工作則留在 foreground。

### Memory

`memory: project` 適合累積：
- codebase pattern
- recurring issue
- architecture decision
- review lesson

如果不希望 memory commit 進 repo，改用 `memory: local`，並忽略 `.claude/agent-memory-local/`。

---

## 4. Hooks

Hooks 適合做 deterministic automation；不要把所有 intelligence 都塞進 hook。

本版只保留兩種：

### 保護 main/master

[protect-main.js](.claude/hooks/protect-main.js)：
- 從 stdin JSON 讀取 event
- 判斷 Edit / Write
- main/master 回傳 `permissionDecision: "deny"`

### Edit 後驗證

[post-edit-checks.js](.claude/hooks/post-edit-checks.js)：
- `async: true` 背景執行
- Prettier check
- TypeScript typecheck
- test file related tests

這比每次 edit 都同步跑完整驗證更不容易拖慢 agent loop。

### 現行 Hook lifecycle

現在除了 `PreToolUse`、`PostToolUse`、`UserPromptSubmit`、`Stop`，也有：

- SessionStart / SessionEnd
- SubagentStart / SubagentStop
- TaskCreated / TaskCompleted
- TeammateIdle
- PermissionDenied
- ConfigChange
- FileChanged
- WorktreeCreate / WorktreeRemove
- PreCompact / PostCompact
- CwdChanged / DirectoryAdded
- Elicitation / ElicitationResult

Hook handler 也不只 shell command，可依事件使用 HTTP、prompt / agent handler 等形式。

完整範例：[settings.md](.claude/settings.md)

---

## 5. MCP

MCP 仍是 Claude Code 連外部系統的主要方式，但 2026/09 更適合優先採 remote HTTP / OAuth，而不是假設每個服務都有固定的舊 stdio npm package。

本 repo [.mcp.json](.mcp.json) 示範：

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_MCP_TOKEN}"
      }
    },
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/mcp"
    },
    "internal-tools": {
      "type": "http",
      "url": "${INTERNAL_MCP_URL}",
      "headers": {
        "Authorization": "Bearer ${INTERNAL_MCP_TOKEN}"
      }
    }
  }
}
```

原則：
- Secret 不 commit。
- Remote MCP 優先 OAuth / environment variable。
- Project MCP server 要讓團隊明確知道它能做什麼。
- 不要為了方便就自動批准所有不熟悉的 MCP server。

---

## 6. LSP 與 Plugins

### LSP

LSP 讓 Claude 取得 diagnostics、type information、definition / reference navigation 等即時 code intelligence。

目前最實用的方式之一，是透過 Claude Code plugin 安裝語言支援，而不是把所有 LSP 細節硬寫進專案文件。

### Plugins

Plugins 已成為 Claude Code extension 的主要 packaging 方式，可一起封裝：

- `skills/`
- `agents/`
- `hooks/`
- `.mcp.json`
- LSP configuration

如果一套 Skills / Agents / Hooks 要在很多 repository 重複使用，應考慮做成 plugin，而不是 copy-paste 整個 `.claude/`。

---

## 7. Worktrees

Claude Code 現在原生支援 worktree：

```bash
claude --worktree feature-auth
# shorthand
claude -w feature-auth
```

預設建立在：

```text
.claude/worktrees/<name>/
```

用途：
- 同一 repo 同時跑多個獨立 task
- 避免 agent 互相踩 working tree
- 長任務隔離
- Subagent 使用 `isolation: worktree`

仍要遵守一個原則：**不要讓兩個 agent 同時修改同一批檔案，然後期待 merge 自己會變簡單。**

---

## 8. Agent Teams

Agent Teams 提供：
- Team lead
- 多個 teammates
- Shared task list
- Mailbox / teammate messaging

它適合真正能分成數個獨立 workstream 的任務，例如：
- Backend / frontend / tests 各自處理
- Research / implementation / verification 分工
- 大型 codebase 多模組分析

但截至 2026/09 仍屬 experimental，因此不要把每個日常 task 都強制包成 team。

實務上先從 **3–5 個 teammates** 的可獨立工作開始，比一次開大量 agents 更合理。

---

## 9. Cross-session messaging

Claude Code 新版可以讓同一台 machine 上的不同 session 透過 `ListAgents` / `SendMessage` 溝通。

適合：
- 獨立 terminal / worktree 間簡短 handoff
- 告知另一個 session task 完成或遇到 blocker
- 不想讓主 orchestrator 持續輪詢 worker

限制：
- 訊息是 text，不會自動傳 conversation / file。
- 需要支援的 Claude Code 版本。
- 原生 Windows 不支援；Windows 可使用 WSL2。
- 本 repo 設定 `crossSessionInbound: "hold"`，避免其他 session 的訊息直接打斷目前工作。

---

## 10. GitHub Actions

原 repo 使用：

```yaml
uses: anthropics/claude-code-action@beta
```

目前改為正式 v1：

```yaml
uses: anthropics/claude-code-action@v1
```

同時：
- 移除寫死的舊 model ID
- model / max-turn / allowed tools 等 CLI 行為集中到 `claude_args`
- 保留最小 GitHub permissions
- PR review、docs sync、quality、dependency audit 都使用同一套 v1 action

範例：
- [PR Review](.github/workflows/pr-claude-code-review.yml)
- [Docs Sync](.github/workflows/scheduled-claude-code-docs-sync.yml)
- [Code Quality](.github/workflows/scheduled-claude-code-quality.yml)
- [Dependency Audit](.github/workflows/scheduled-claude-code-dependency-audit.yml)

---

## 11. 建議的實務配置

不需要一開始就把所有功能開滿。

### 小型／一般專案

先用：
1. `CLAUDE.md`
2. 3–6 個高價值 Skills
3. 1 個 code-reviewer subagent
4. 幾個 deterministic hooks
5. 必要的 MCP

### 複雜專案

再增加：
- project-memory subagent
- Worktree isolation
- Plugins
- GitHub Actions
- background subagents

### 真正需要 parallel orchestration 時

才考慮：
- Agent Teams
- cross-session messaging
- 多 worktree

**越多 agent、hook、skill 不代表效果越好。** 每多一層 orchestration，就多一層 context、permission、debugging 與 cost 管理。

---

## 原版中哪些內容被刻意移除？

### `.claude/commands/`

不是因為不能用，而是因為 Custom Commands 已併入 Skills；本版把 workflow 全部搬到 `.claude/skills/`。

### 自製 `skill-eval.js` / `skill-rules.json`

原本很有創意，但現在 Skill discovery 已原生提供更好的基本 routing。只有 organization 有 deterministic policy 時才值得保留自製 router。

### 舊的 MCP npm package 範例

不再假設 `@anthropic/mcp-jira`、`@anthropic/mcp-github` 等 package 一定是現行官方路徑。本版改用官方 remote MCP 範例與 generic internal MCP。

### 寫死 model version

這類 showcase 很容易因 model retirement 快速過時，因此更新版優先使用 `inherit` 或 action default。

---

## 官方文件

- [Claude Code Overview](https://code.claude.com/docs/)
- [Skills](https://code.claude.com/docs/en/skills)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Hooks](https://code.claude.com/docs/en/hooks)
- [MCP](https://code.claude.com/docs/en/mcp)
- [Plugins](https://code.claude.com/docs/en/plugins)
- [Worktrees](https://code.claude.com/docs/en/worktrees)
- [Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)
- [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action)

---

## License

沿用原專案授權。
