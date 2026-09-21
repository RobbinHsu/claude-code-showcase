# Claude Code Skills（2026-09）

Claude Code 已把舊式 Custom Commands 的能力整合進 Skills。`.claude/commands/*.md` 仍可相容使用，但新專案建議統一放在：

```text
.claude/skills/<skill-name>/SKILL.md
```

## 本專案 Skills

### Domain Knowledge
| Skill | 用途 |
|---|---|
| [testing-patterns](./testing-patterns/SKILL.md) | Jest、TDD、test factories、mocking |
| [systematic-debugging](./systematic-debugging/SKILL.md) | Root-cause-first debugging |
| [react-ui-patterns](./react-ui-patterns/SKILL.md) | React loading/error/empty state |
| [core-components](./core-components/SKILL.md) | Design system / components |
| [formik-patterns](./formik-patterns/SKILL.md) | Formik form / validation |
| [graphql-schema](./graphql-schema/SKILL.md) | GraphQL operation / codegen |

### 手動 Workflow Skills
| Skill | 用途 |
|---|---|
| [onboard](./onboard/SKILL.md) | 深入理解 task 與 codebase |
| [ticket](./ticket/SKILL.md) | JIRA/Linear ticket end-to-end |
| [pr-review](./pr-review/SKILL.md) | PR review |
| [pr-summary](./pr-summary/SKILL.md) | 產生 PR summary |
| [code-quality](./code-quality/SKILL.md) | Code quality review |
| [docs-sync](./docs-sync/SKILL.md) | Docs/code consistency |

## 目前 Frontmatter

目前所有欄位都是 optional；`description` 最值得保留，因為 Claude 會用它判斷何時使用。

常用欄位：

| Field | 用途 |
|---|---|
| `name` | Skill 顯示名稱；預設為 directory name |
| `description` | Skill 做什麼、何時使用 |
| `when_to_use` | 補充 trigger / 使用情境 |
| `argument-hint` | slash command autocomplete 顯示參數提示 |
| `arguments` | Named positional arguments |
| `disable-model-invocation` | `true` 時只有 user 能手動觸發 |
| `user-invocable` | 是否顯示為 user 可呼叫 skill |
| `allowed-tools` | Skill 當回合允許的 tools |
| `disallowed-tools` | Skill 當回合移除的 tools |
| `context` | 設為 `fork` 時在獨立 subagent context 執行 |
| `agent` | `context: fork` 時指定 subagent |

## Domain Knowledge Skill

Domain skill 通常允許 Claude 自動選擇：

```markdown
---
name: testing-patterns
description: 本專案的 Jest/TDD pattern。撰寫或修改 tests 時使用。
when_to_use: 使用者要求測試、TDD、mock、test factory 時。
---

# Testing Patterns
...
```

不需要再另外維護 keyword router；skill description 應直接寫清楚「何時用」。

## 手動 Workflow Skill

會產生 side effect 或需要明確時機的 workflow，使用 `disable-model-invocation: true`：

```markdown
---
name: pr-review
description: Review 指定 PR
argument-hint: "[pr-number]"
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(gh *) Bash(git *)
---

Review PR $ARGUMENTS。
```

## Context Fork

`context: fork` 會讓 skill 在獨立 subagent context 執行，適合：
- PR review
- 大型 code exploration
- docs audit
- 不希望污染主 conversation 的 research

## Dynamic Context

Skill 可以在載入前執行 shell command，把輸出插入 prompt。這適合把 PR diff、branch status 等 live data 注入 skill；但對有副作用的 command 仍應保留 permission 控制。

## Subagent 預載 Skills

Subagent frontmatter 的 `skills:` 可以在啟動時把完整 skill 內容預載進 subagent，而不是等它自行發現。

## 維護原則

- SKILL.md 保持精簡，詳細資料放 supporting files。
- 不要把容易變動的完整 model ID 寫死在一般 skill。
- Side-effect workflow 用 `disable-model-invocation: true`。
- 需要隔離 context 時才用 `context: fork`；不要所有 skill 都 fork。
