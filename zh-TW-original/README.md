# Claude Code 專案設定展示

> 大多數軟體工程師其實嚴重低估了目前 LLM Agent 的能力，尤其是 Claude Code 這類工具。

完成 Claude Code 設定後，你可以把它指向你的 codebase，讓它學習團隊慣例、載入最佳實務，並不斷調整，直到它幾乎像一位能力被大幅強化的隊友。**真正能解鎖效益的關鍵，是建立一套可重複使用的「[skills](#skills---領域知識)」，再搭配幾個處理日常工作用的「[agents](#agents---專門助理)」。**

### 實際使用起來是什麼樣子

**自訂 UI Library？** 我們有一個 [skill，會精確說明如何使用它](.claude/skills/core-components/SKILL.md)。[測試撰寫方式](.claude/skills/testing-patterns/SKILL.md)、[GraphQL 架構方式](.claude/skills/graphql-schema/SKILL.md)也一樣，基本上 repo 裡希望怎麼做，都可以寫成 skill。因此 Claude 產生程式碼時，一開始就能符合我們的 pattern 與標準。

**自動化 Quality Gate？** 我們使用 [hooks](.claude/settings.json) 自動格式化程式碼、測試檔變更時執行 tests、檢查 TypeScript 型別，甚至[禁止在 main branch 上直接修改](.claude/settings.md)。Claude Code 也建立了多項 ESLint automation，包括自訂 rules 與 lint checks，在進入 review 前先攔下問題。

**深入 Code Review？** 我們有一個 [code review agent](.claude/agents/code-reviewer.md)，Claude 完成修改後會執行它。它會依詳細 checklist 檢查 TypeScript strict mode、error handling、loading state、mutation pattern 等。PR 建立後，我們也有一個 [GitHub Action](.github/workflows/pr-claude-code-review.yml) 自動執行完整 PR review。

**排程維護？** 我們有會定期執行的 GitHub workflow agents：
- [每月文件同步](.github/workflows/scheduled-claude-code-docs-sync.yml) - 讀取前一個月 commits，確認文件仍與程式碼一致
- [每週程式品質](.github/workflows/scheduled-claude-code-quality.yml) - 檢查隨機目錄並自動修正問題
- [每兩週 dependency audit](.github/workflows/scheduled-claude-code-dependency-audit.yml) - 安全更新 dependencies 並以 tests 驗證

**智慧 Skill 建議？** 我們建立了 [skill evaluation system](#skill-evaluation-hooks)，會分析每一個 prompt，根據 keyword、file path 與 intent pattern，自動建議 Claude 應啟用哪些 skills。

大量維護與品質工作就這樣被自動化，而且運作得非常順暢。

**JIRA/Linear 整合？** 我們透過 [MCP servers](.mcp.json) 把 Claude Code 連接到 ticket system。現在 Claude 可以讀取 ticket、理解需求、實作功能、更新 ticket status，甚至在過程中發現 bug 時自行建立新 ticket。[`/ticket` command](.claude/commands/ticket.md) 會處理完整 workflow——從讀取 acceptance criteria 到把 PR 連回 ticket。

我們甚至會用 Claude Code 做 ticket triage。它會讀 ticket、深入 codebase，然後留言說明它認為應該怎麼做。工程師接手時，等於已經完成一半前置工作。

**這裡有非常多低垂果實，我真的很意外竟然不是所有人都在使用。**

---

## 目錄

- [目錄結構](#目錄結構)
- [快速開始](#快速開始)
- [設定參考](#設定參考)
  - [CLAUDE.md - 專案記憶](#claudemd---專案記憶)
  - [settings.json - Hooks 與環境](#settingsjson---hooks-與環境)
  - [MCP Servers - 外部整合](#mcp-servers---外部整合)
  - [LSP Servers - 即時程式碼智慧](#lsp-servers---即時程式碼智慧)
  - [Skill Evaluation Hooks](#skill-evaluation-hooks)
  - [Skills - 領域知識](#skills---領域知識)
  - [Agents - 專門助理](#agents---專門助理)
  - [Commands - Slash Commands](#commands---slash-commands)
- [GitHub Actions Workflows](#github-actions-workflows)
- [最佳實務](#最佳實務)
- [此 Repository 的範例](#此-repository-的範例)

---

## 目錄結構

```
your-project/
├── CLAUDE.md                      # 專案記憶（另一個可用位置）
├── .mcp.json                      # MCP server 設定（JIRA、GitHub 等）
├── .claude/
│   ├── settings.json              # Hooks、環境、權限
│   ├── settings.local.json        # 個人覆寫（gitignored）
│   ├── settings.md                # 給人閱讀的 hook 文件
│   ├── .gitignore                 # 忽略本機／個人檔案
│   │
│   ├── agents/                    # 自訂 AI agents
│   │   └── code-reviewer.md       # 主動 code review agent
│   │
│   ├── commands/                  # Slash commands (/command-name)
│   │   ├── onboard.md             # 深入 task exploration
│   │   ├── pr-review.md           # PR review workflow
│   │   └── ...
│   │
│   ├── hooks/                     # Hook scripts
│   │   ├── skill-eval.sh          # prompt submit 時做 skill matching
│   │   ├── skill-eval.js          # Node.js skill matching engine
│   │   └── skill-rules.json       # Pattern matching 設定
│   │
│   ├── skills/                    # 領域知識文件
│   │   ├── README.md              # Skills 總覽
│   │   ├── testing-patterns/
│   │   │   └── SKILL.md
│   │   ├── graphql-schema/
│   │   │   └── SKILL.md
│   │   └── ...
│   │
│   └── rules/                     # 模組化 instructions（選用）
│       ├── code-style.md
│       └── security.md
│
└── .github/
    └── workflows/
        ├── pr-claude-code-review.yml           # 自動 PR review
        ├── scheduled-claude-code-docs-sync.yml # 每月 docs sync
        ├── scheduled-claude-code-quality.yml   # 每週 quality review
        └── scheduled-claude-code-dependency-audit.yml
```

---

## 快速開始

### 1. 建立 `.claude` 目錄

```bash
mkdir -p .claude/{agents,commands,hooks,skills}
```

### 2. 加入 CLAUDE.md

在專案根目錄建立 `CLAUDE.md`，放入專案的重要資訊。完整範例請參考 [CLAUDE.md](CLAUDE.md)。

```markdown
# Project Name

## Quick Facts
- **Stack**: React, TypeScript, Node.js
- **Test Command**: `npm run test`
- **Lint Command**: `npm run lint`

## Key Directories
- `src/components/` - React components
- `src/api/` - API layer
- `tests/` - Test files

## Code Style
- TypeScript strict mode
- Prefer interfaces over types
- No `any` - use `unknown`
```

### 3. 加入包含 hooks 的 settings.json

建立 `.claude/settings.json`。完整的 auto-format、testing 等設定範例請參考 [settings.json](.claude/settings.json)。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[ \"$(git branch --show-current)\" != \"main\" ] || { echo '{\"block\": true, \"message\": \"Cannot edit on main branch\"}' >&2; exit 2; }",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### 4. 加入第一個 skill

建立 `.claude/skills/testing-patterns/SKILL.md`。完整範例請參考 [testing-patterns/SKILL.md](.claude/skills/testing-patterns/SKILL.md)。

```markdown
---
name: testing-patterns
description: Jest testing patterns for this project. Use when writing tests, creating mocks, or following TDD workflow.
---

# Testing Patterns

## Test Structure
- Use `describe` blocks for grouping
- Use `it` for individual tests
- Follow AAA pattern: Arrange, Act, Assert

## Mocking
- Use factory functions: `getMockUser(overrides)`
- Mock external dependencies, not internal modules
```

> **提示：** `description` 欄位很重要——Claude 會用它判斷什麼時候套用 skill。請放入使用者自然會提到的 keyword。

---

## 設定參考

### CLAUDE.md - 專案記憶

CLAUDE.md 是 Claude 的持久專案記憶，session 開始時會自動載入。

**位置（依優先順序）：**
1. `.claude/CLAUDE.md`（project，在 .claude folder）
2. `./CLAUDE.md`（project root）
3. `~/.claude/CLAUDE.md`（user-level，套用所有 projects）

**建議包含：**
- 專案 stack 與 architecture overview
- 重要 commands（test、build、lint、deploy）
- Code style guidelines
- 重要 directories 與用途
- 關鍵 rules 與 constraints

**📄 範例：** [CLAUDE.md](CLAUDE.md)

---

### settings.json - Hooks 與環境

主要設定檔，用來設定 hooks、environment variables 與 permissions。

**位置：** `.claude/settings.json`

**📄 範例：** [settings.json](.claude/settings.json) | [給人看的文件](.claude/settings.md)

#### Hook Events

| Event | 觸發時機 | 使用情境 |
|-------|----------|----------|
| `PreToolUse` | 工具執行前 | 阻止 main branch 編輯、驗證 commands |
| `PostToolUse` | 工具完成後 | 自動 format、執行 tests、lint |
| `UserPromptSubmit` | 使用者送出 prompt | 加入 context、建議 skills |
| `Stop` | Agent 完成 | 判斷 Claude 是否應繼續 |

#### Hook Response Format

```json
{
  "block": true,
  "message": "Reason",
  "feedback": "Info",
  "suppressOutput": true,
  "continue": false
}
```

#### Exit Codes
- `0` - 成功
- `2` - Blocking error（僅 PreToolUse，會阻止 tool）
- 其他 - Non-blocking error

---

### MCP Servers - 外部整合

MCP（Model Context Protocol）server 讓 Claude Code 能連接 JIRA、GitHub、Slack、database 等外部工具。這就是你能建立「讀 ticket → 實作 → 更新 ticket status」workflow 的方式。

**位置：** `.mcp.json`（project root，commit 進 git 供團隊共享）

**📄 範例：** [.mcp.json](.mcp.json)

#### MCP 如何運作

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Claude Code   │────▶│   MCP Server    │────▶│  External API   │
│                 │◀────│  (local bridge) │◀────│  (JIRA, GitHub) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

MCP servers 在本機執行，並提供 Claude 操作外部服務的 tools。設定 JIRA MCP server 後，Claude 就能取得 `jira_get_issue`、`jira_update_issue`、`jira_create_issue` 等工具。

#### .mcp.json 格式

```json
{
  "mcpServers": {
    "server-name": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-name"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

**欄位：**

| Field | 必填 | 說明 |
|-------|------|------|
| `type` | 是 | Server type：`stdio`（local process）或 `http`（remote） |
| `command` | stdio 必填 | 要執行的 executable，例如 `npx`、`python` |
| `args` | 否 | Command-line arguments |
| `env` | 否 | Environment variables（支援 `${VAR}` 展開） |
| `url` | http 必填 | Remote server URL |
| `headers` | http 必填 | HTTP authentication headers |

#### 範例：JIRA Integration

```json
{
  "mcpServers": {
    "jira": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-jira"],
      "env": {
        "JIRA_HOST": "${JIRA_HOST}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    }
  }
}
```

**可以做到：**
- 讀取 ticket details、acceptance criteria 與 comments
- 更新 ticket status（To Do → In Progress → In Review）
- 加入進度 comments
- 為開發期間發現的 bug 建立新 tickets
- 將 PR 連結到 tickets

**搭配 [`/ticket` command](.claude/commands/ticket.md) 的 workflow 範例：**
```
You: /ticket PROJ-123

Claude:
1. Fetching PROJ-123 from JIRA...
   "Add user profile avatar upload"

2. Reading acceptance criteria...
   - Upload button on profile page
   - Support JPG/PNG up to 5MB
   - Show loading state

3. Searching codebase for related files...
   Found: src/screens/Profile/ProfileScreen.tsx

4. Creating branch: cw/PROJ-123-avatar-upload

5. [Implements feature...]

6. Updating JIRA status to "In Review"
   Adding comment: "PR #456 ready for review"

7. Creating PR linked to PROJ-123...
```

#### 常見 MCP Server 設定

**Issue Tracking：**
```json
{
  "jira": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-jira"],
    "env": {
      "JIRA_HOST": "${JIRA_HOST}",
      "JIRA_EMAIL": "${JIRA_EMAIL}",
      "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
    }
  },
  "linear": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-linear"],
    "env": { "LINEAR_API_KEY": "${LINEAR_API_KEY}" }
  }
}
```

**Code & DevOps：**
```json
{
  "github": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-github"],
    "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
  },
  "sentry": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-sentry"],
    "env": {
      "SENTRY_AUTH_TOKEN": "${SENTRY_AUTH_TOKEN}",
      "SENTRY_ORG": "${SENTRY_ORG}"
    }
  }
}
```

**Communication：**
```json
{
  "slack": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
      "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
    }
  }
}
```

**Databases：**
```json
{
  "postgres": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@anthropic/mcp-postgres"],
    "env": { "DATABASE_URL": "${DATABASE_URL}" }
  }
}
```

#### Environment Variables

MCP config 支援變數展開：
- `${VAR}` - 展開 environment variable（未設定時失敗）
- `${VAR:-default}` - VAR 未設定時使用 default

請在 shell profile 或 `.env` file 中設定（不要 commit secrets！）：
```bash
export JIRA_HOST="https://yourcompany.atlassian.net"
export JIRA_EMAIL="you@company.com"
export JIRA_API_TOKEN="your-api-token"
```

#### MCP 的 Settings

可在 `settings.json` 自動批准 MCP servers：

```json
{
  "enableAllProjectMcpServers": true
}
```

或只允許特定 servers：
```json
{
  "enabledMcpjsonServers": ["jira", "github", "slack"]
}
```

---

### LSP Servers - 即時程式碼智慧

LSP（Language Server Protocol）讓 Claude 即時理解你的程式碼——型別資訊、errors、completions、navigation。Claude 不再只是讀文字，而能像 IDE 一樣「看見」程式碼。

**為什麼重要：** 當你修改 TypeScript 時，Claude 能立即知道是否引入 type error。引用 function 時，Claude 可跳到 definition。這能大幅改善 code generation 品質。

#### 啟用 LSP

在 `settings.json` 透過 plugins 啟用 LSP：

```json
{
  "enabledPlugins": {
    "typescript-lsp@claude-plugins-official": true,
    "pyright-lsp@claude-plugins-official": true
  }
}
```

#### Claude 從 LSP 得到什麼

| Feature | 說明 |
|---------|------|
| **Diagnostics** | 每次 edit 後即時取得 errors 與 warnings |
| **Type Information** | Hover info、function signatures、type definitions |
| **Code Navigation** | Go to definition、find references |
| **Completions** | 依 context 提供 symbol suggestions |

#### 可用 LSP Plugins

| Plugin | Language | 需先安裝 Binary |
|--------|----------|----------------|
| `typescript-lsp` | TypeScript/JavaScript | `npm install -g typescript-language-server typescript` |
| `pyright-lsp` | Python | `pip install pyright` |
| `rust-lsp` | Rust | `rustup component add rust-analyzer` |

#### 自訂 LSP 設定

進階設定可建立 `.lsp.json`：

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact"
    },
    "initializationOptions": {
      "preferences": {
        "quotePreference": "single"
      }
    }
  }
}
```

#### Troubleshooting

如果 LSP 沒有正常運作：

1. **確認 binary 已安裝：**
   ```bash
   which typescript-language-server  # Should return a path
   ```

2. **啟用 debug logging：**
   ```bash
   claude --enable-lsp-logging
   ```

3. **檢查 plugin status：**
   ```bash
   claude /plugin  # View Errors tab
   ```

---

### Skill Evaluation Hooks

我們最強的 automation 之一，是 **skill evaluation system**。每次送出 prompt 都會執行，並智慧判斷 Claude 應啟用哪些 skills。

**📄 Files：** [skill-eval.sh](.claude/hooks/skill-eval.sh) | [skill-eval.js](.claude/hooks/skill-eval.js) | [skill-rules.json](.claude/hooks/skill-rules.json)

#### 如何運作

你送出 prompt 時，`UserPromptSubmit` hook 會觸發 skill evaluation engine：

1. **Prompt Analysis** - engine 會分析：
   - **Keywords**：簡單文字比對（`test`、`form`、`graphql`、`bug`）
   - **Patterns**：Regex matching（`\btest(?:s|ing)?\b`、`\.stories\.`）
   - **File Paths**：抽取提到的檔案（`src/components/Button.tsx`）
   - **Intent**：判斷你想做什麼（`create.*test`、`fix.*bug`）

2. **Directory Mapping** - 把 file path 對應到相關 skills：
   ```json
   {
     "src/components/core": "core-components",
     "src/graphql": "graphql-schema",
     ".github/workflows": "github-actions",
     "src/hooks": "react-ui-patterns"
   }
   ```

3. **Confidence Scoring** - 每種 trigger type 有分數：
   ```json
   {
     "keyword": 2,
     "keywordPattern": 3,
     "pathPattern": 4,
     "directoryMatch": 5,
     "intentPattern": 4
   }
   ```

4. **Skill Suggestion** - 超過 confidence threshold 的 skills 會附原因被建議：
   ```
   SKILL ACTIVATION REQUIRED

   Detected file paths: src/components/UserForm.tsx

   Matched skills (ranked by relevance):
   1. formik-patterns (HIGH confidence)
      Matched: keyword "form", path "src/components/UserForm.tsx"
   2. react-ui-patterns (MEDIUM confidence)
      Matched: directory mapping, keyword "component"
   ```

#### 設定

Skills 定義於 [skill-rules.json](.claude/hooks/skill-rules.json)：

```json
{
  "testing-patterns": {
    "description": "Jest testing patterns and TDD workflow",
    "priority": 9,
    "triggers": {
      "keywords": ["test", "jest", "spec", "tdd", "mock"],
      "keywordPatterns": ["\\btest(?:s|ing)?\\b", "\\bspec\\b"],
      "pathPatterns": ["**/*.test.ts", "**/*.test.tsx"],
      "intentPatterns": [
        "(?:write|add|create|fix).*(?:test|spec)",
        "(?:test|spec).*(?:for|of|the)"
      ]
    },
    "excludePatterns": ["e2e", "maestro", "end-to-end"]
  }
}
```

#### 加入你的專案

1. 複製 hooks：
   ```bash
   cp -r .claude/hooks/ your-project/.claude/hooks/
   ```

2. 在 `settings.json` 加入 hook：
   ```json
   {
     "hooks": {
       "UserPromptSubmit": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/skill-eval.sh",
               "timeout": 5
             }
           ]
         }
       ]
     }
   }
   ```

3. 依專案 skills 與 triggers 修改 [skill-rules.json](.claude/hooks/skill-rules.json)。

---

### Skills - 領域知識

Skills 是教 Claude 專案專屬 patterns 與 conventions 的 Markdown 文件。

**位置：** `.claude/skills/{skill-name}/SKILL.md`

**📄 範例：**
- [testing-patterns](.claude/skills/testing-patterns/SKILL.md) - TDD、factory functions、mocking
- [systematic-debugging](.claude/skills/systematic-debugging/SKILL.md) - 四階段 debugging methodology
- [react-ui-patterns](.claude/skills/react-ui-patterns/SKILL.md) - Loading states、error handling
- [graphql-schema](.claude/skills/graphql-schema/SKILL.md) - Queries、mutations、codegen
- [core-components](.claude/skills/core-components/SKILL.md) - Design system、tokens
- [formik-patterns](.claude/skills/formik-patterns/SKILL.md) - Form handling、validation

#### SKILL.md Frontmatter 欄位

| Field | 必填 | 最大長度 | 說明 |
|-------|------|----------|------|
| `name` | **是** | 64 chars | 只能用小寫字母、數字、hyphen。應與 directory name 相同。 |
| `description` | **是** | 1024 chars | Skill 做什麼、何時使用。Claude 會用它判斷何時套用。 |
| `allowed-tools` | 否 | - | Claude 可使用的逗號分隔 tool list，例如 `Read, Grep, Bash(npm:*)`。 |
| `model` | 否 | - | 指定 model，例如 `claude-sonnet-4-20250514`。 |

#### SKILL.md 格式

```markdown
---
name: skill-name
description: What this skill does and when to use it. Include keywords users would mention.
allowed-tools: Read, Grep, Glob
model: claude-sonnet-4-20250514
---

# Skill Title

## When to Use
- Trigger condition 1
- Trigger condition 2

## Core Patterns

### Pattern Name
~~~typescript
// Example code
~~~

## Anti-Patterns

### What NOT to Do
~~~typescript
// Bad example
~~~

## Integration
- Related skill: `other-skill`
```

#### Skills 最佳實務

1. **保持 SKILL.md 聚焦** - 少於 500 行；詳細文件放到另外的 referenced files
2. **寫出容易觸發的 descriptions** - Claude 會用 semantic matching 判斷何時套用
3. **加入 examples** - 同時展示 good / bad patterns
4. **引用其他 skills** - 說明 skills 如何協作
5. **檔名必須精確** - 必須是 `SKILL.md`（case-sensitive）

---

### Agents - 專門助理

Agents 是具有特定目的與獨立 prompt 的 AI assistants。

**位置：** `.claude/agents/{agent-name}.md`

**📄 範例：**
- [code-reviewer.md](.claude/agents/code-reviewer.md) - 使用 checklist 的完整 code review
- [github-workflow.md](.claude/agents/github-workflow.md) - Git commits、branches、PRs

#### Agent 格式

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and conventions. Use after writing or modifying code.
model: opus
---

# Agent System Prompt

You are a senior code reviewer...

## Your Process
1. Run `git diff` to see changes
2. Apply review checklist
3. Provide feedback

## Checklist
- [ ] No TypeScript `any`
- [ ] Error handling present
- [ ] Tests included
```

#### Agent 設定欄位

| Field | 必填 | 說明 |
|-------|------|------|
| `name` | 是 | 小寫 + hyphens |
| `description` | 是 | 何時／為何使用（最大 1024 chars） |
| `model` | 否 | `sonnet`、`opus` 或 `haiku` |
| `tools` | 否 | 逗號分隔的 tool list |

---

### Commands - Slash Commands

可用 `/command-name` 呼叫的 custom commands。

**位置：** `.claude/commands/{command-name}.md`

**📄 範例：**
- [onboard.md](.claude/commands/onboard.md) - 深入探索 task
- [pr-review.md](.claude/commands/pr-review.md) - PR review workflow
- [pr-summary.md](.claude/commands/pr-summary.md) - 產生 PR description
- [code-quality.md](.claude/commands/code-quality.md) - Quality checks
- [docs-sync.md](.claude/commands/docs-sync.md) - Documentation alignment

#### Command 格式

```markdown
---
description: Brief description shown in command list
allowed-tools: Bash(git:*), Read, Grep
---

# Command Instructions

Your task is to: $ARGUMENTS

## Steps
1. Do this first
2. Then do this
```

#### Variables

- `$ARGUMENTS` - 所有 arguments 合成單一 string
- `$1`、`$2`、`$3` - 個別 positional arguments

#### Inline Bash

```markdown
Current branch: !`git branch --show-current`
Recent commits: !`git log --oneline -5`
```

---

## GitHub Actions Workflows

使用 Claude Code 自動化 code review、quality check 與 maintenance。

**📄 範例：**
- [pr-claude-code-review.yml](.github/workflows/pr-claude-code-review.yml) - 自動 PR review
- [scheduled-claude-code-docs-sync.yml](.github/workflows/scheduled-claude-code-docs-sync.yml) - 每月 docs sync
- [scheduled-claude-code-quality.yml](.github/workflows/scheduled-claude-code-quality.yml) - 每週 quality review
- [scheduled-claude-code-dependency-audit.yml](.github/workflows/scheduled-claude-code-dependency-audit.yml) - 每兩週 dependency updates

### PR Code Review

自動 review PR，並回應 `@claude` mention。

```yaml
name: PR - Claude Code Review
on:
  pull_request:
    types: [opened, synchronize, reopened]
  issue_comment:
    types: [created]

jobs:
  review:
    if: |
      github.event_name == 'pull_request' ||
      (github.event_name == 'issue_comment' &&
       github.event.issue.pull_request &&
       contains(github.event.comment.body, '@claude'))
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          model: claude-opus-4-5-20251101
          prompt: |
            Review this PR using .claude/agents/code-reviewer.md standards.
            Run `git diff origin/main...HEAD` to see changes.
```

### 排程 Workflows

| Workflow | Schedule | 用途 |
|----------|----------|------|
| [Code Quality](.github/workflows/scheduled-claude-code-quality.yml) | 每週（日） | Review 隨機 directories、自動修正 issues |
| [Docs Sync](.github/workflows/scheduled-claude-code-docs-sync.yml) | 每月（1 日） | 確認 docs 與 code changes 一致 |
| [Dependency Audit](.github/workflows/scheduled-claude-code-dependency-audit.yml) | 每兩週（1、15 日） | 安全更新 dependencies 並執行 testing |

### 必要設定

把 `ANTHROPIC_API_KEY` 加到 repository secrets：
- Settings → Secrets and variables → Actions → New repository secret

### 成本估算

| Workflow | Frequency | 預估成本 |
|----------|-----------|----------|
| PR Review | 每個 PR | ~$0.05 - $0.50 |
| Docs Sync | 每月 | ~$0.50 - $2.00 |
| Dependency Audit | 每兩週 | ~$0.20 - $1.00 |
| Code Quality | 每週 | ~$1.00 - $5.00 |

**每月估算總額：** 約 $10 - $50（依 PR 數量而定）

---

## 最佳實務

### 1. 從 CLAUDE.md 開始

你的 `CLAUDE.md` 是基礎。建議包含：
- Stack overview
- 重要 commands
- Critical rules
- Directory structure

### 2. 逐步建立 Skills

不要一次把所有東西都文件化：
1. 先處理最常見 patterns
2. 遇到痛點時再增加 skills
3. 每個 skill 聚焦單一 domain

### 3. 用 Hooks 做 Automation

讓 hooks 處理重複工作：
- 儲存後自動 format
- test file 變更後執行 tests
- schema 變更後重新產生 types
- 阻止 protected branch 上的 edit

### 4. 為複雜 Workflow 建立 Agents

Agents 很適合：
- Code review（搭配團隊 checklist）
- PR creation 與 management
- Debugging workflows
- Task onboarding

### 5. 善用 GitHub Actions

自動化 maintenance：
- 每個 PR 自動 review
- 每週 quality sweep
- 每月 docs alignment
- Dependency update

### 6. 將設定納入版本控制

除了以下項目，其餘都 commit：
- `settings.local.json`（個人偏好）
- `CLAUDE.local.md`（個人 notes）
- User-specific credentials

---

## 此 Repository 的範例

| File | 說明 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | 專案記憶檔範例 |
| [.claude/settings.json](.claude/settings.json) | 完整 hooks 設定 |
| [.claude/settings.md](.claude/settings.md) | 給人閱讀的 hooks 文件 |
| [.mcp.json](.mcp.json) | MCP server 設定（JIRA、GitHub、Slack 等） |
| **Agents** | |
| [.claude/agents/code-reviewer.md](.claude/agents/code-reviewer.md) | 完整 code review agent |
| [.claude/agents/github-workflow.md](.claude/agents/github-workflow.md) | Git workflow agent |
| **Commands** | |
| [.claude/commands/onboard.md](.claude/commands/onboard.md) | 深入 task exploration |
| [.claude/commands/ticket.md](.claude/commands/ticket.md) | **JIRA/Linear ticket workflow（read → implement → update）** |
| [.claude/commands/pr-review.md](.claude/commands/pr-review.md) | PR review workflow |
| [.claude/commands/pr-summary.md](.claude/commands/pr-summary.md) | 產生 PR summary |
| [.claude/commands/code-quality.md](.claude/commands/code-quality.md) | Quality checks |
| [.claude/commands/docs-sync.md](.claude/commands/docs-sync.md) | Documentation sync |
| **Hooks** | |
| [.claude/hooks/skill-eval.sh](.claude/hooks/skill-eval.sh) | Skill evaluation wrapper |
| [.claude/hooks/skill-eval.js](.claude/hooks/skill-eval.js) | Node.js skill matching engine |
| [.claude/hooks/skill-rules.json](.claude/hooks/skill-rules.json) | Pattern matching rules |
| **Skills** | |
| [.claude/skills/testing-patterns/SKILL.md](.claude/skills/testing-patterns/SKILL.md) | TDD、factory functions、mocking |
| [.claude/skills/systematic-debugging/SKILL.md](.claude/skills/systematic-debugging/SKILL.md) | 四階段 debugging |
| [.claude/skills/react-ui-patterns/SKILL.md](.claude/skills/react-ui-patterns/SKILL.md) | Loading/error/empty states |
| [.claude/skills/graphql-schema/SKILL.md](.claude/skills/graphql-schema/SKILL.md) | Queries、mutations、codegen |
| [.claude/skills/core-components/SKILL.md](.claude/skills/core-components/SKILL.md) | Design system、tokens |
| [.claude/skills/formik-patterns/SKILL.md](.claude/skills/formik-patterns/SKILL.md) | Form handling、validation |
| **GitHub Workflows** | |
| [.github/workflows/pr-claude-code-review.yml](.github/workflows/pr-claude-code-review.yml) | 自動 PR review |
| [.github/workflows/scheduled-claude-code-docs-sync.yml](.github/workflows/scheduled-claude-code-docs-sync.yml) | 每月 docs sync |
| [.github/workflows/scheduled-claude-code-quality.yml](.github/workflows/scheduled-claude-code-quality.yml) | 每週 quality review |
| [.github/workflows/scheduled-claude-code-dependency-audit.yml](.github/workflows/scheduled-claude-code-dependency-audit.yml) | 每兩週 dependency audit |

---

## 延伸閱讀

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Claude Code Action](https://github.com/anthropics/claude-code-action) - GitHub Action
- [Anthropic API](https://docs.anthropic.com/en/api)

---

## License

MIT - 可將此專案作為你自己專案的 template。
