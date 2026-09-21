# Claude Code Showcase — 正體中文雙版本

此 branch 提供兩套內容，目的不同，請不要混用。

## 版本

### 1. [zh-TW-original](./zh-TW-original/)

**2026/01 原始版本的忠實正體中文翻譯。**

原則：
- 保留原始 repository 的目錄與檔案。
- 不修正已過時的 Claude Code 用法。
- 不更換 model ID、Action version、MCP package、hook architecture。
- Markdown、Agent prompt、Skill 說明、Workflow prompt 等人類閱讀內容翻成正體中文。
- 程式碼、設定 key、path、regex、command 與會影響行為的 identifier 保持原樣。
- 可執行 source code（例如 skill router JS）保留原始邏輯與程式內容，避免翻譯造成 behavior change。

這一版適合用來理解「原作者在 2026/01 實際提出了什麼做法」。

### 2. [zh-TW-2026-09](./zh-TW-2026-09/)

**依 2026/09 Claude Code 官方能力重新整理的繁中版本。**

主要更新：

| 項目 | 2026/01 原版 | 2026/09 更新版 |
|---|---|---|
| Reusable workflow | `.claude/commands/*.md` | `.claude/skills/<name>/SKILL.md` |
| Skill routing | 自製 `skill-eval.js` / regex rules | Skill `description` / `when_to_use` |
| Skill context | 主 context | 可用 `context: fork` |
| Subagent | 基本 agent | skills preload、memory、permission mode、background、worktree isolation、MCP scope |
| Hooks | 舊 env-based 範例 | stdin JSON + current decision schema + async hook |
| 平行工作 | 手動 session | Worktrees、background subagents、Agent Teams |
| Session 溝通 | 無 | Cross-session messaging |
| Extension | 零散設定 | Plugins |
| GitHub Action | `@beta` | `@v1` |
| MCP | 多個舊 stdio package 範例 | Remote HTTP / OAuth / env-based credential |
| Model | 寫死舊 model ID | 優先 `inherit` / action default |

## 為什麼保留兩版？

原版的價值在於它是一個完整、具體的 Claude Code harness 範例，包含 Skills、Agents、Hooks、MCP、LSP 與 GitHub Actions。

但 Claude Code 在 2026 年持續快速演進。如果直接把舊 repo 翻成中文，讀者容易把「2026/01 可用的方法」誤認為「2026/09 最推薦的方法」。

因此：
- 要研究原作者設計 → 看 `zh-TW-original/`
- 要拿來建立現在的新專案 → 優先看 `zh-TW-2026-09/`

## 圖片處理原則

如果原始 repository 出現圖片或其他 binary asset：
- 原檔完整照搬
- 不翻譯圖片中文字
- 不裁切
- 不壓縮
- 不重新產生

等人工檢視後，再決定是否另外製作繁中圖片。

## 2026/09 更新依據

主要依據 Claude Code 官方文件：
- [Skills](https://code.claude.com/docs/en/skills)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Hooks](https://code.claude.com/docs/en/hooks)
- [MCP](https://code.claude.com/docs/en/mcp)
- [Plugins](https://code.claude.com/docs/en/plugins)
- [Worktrees](https://code.claude.com/docs/en/worktrees)
- [Agent Teams](https://code.claude.com/docs/en/agent-teams)
- [Cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging)
- [Claude Code Action](https://github.com/anthropics/claude-code-action)

## 建議閱讀順序

1. 先看 [原版 README](./zh-TW-original/README.md)，了解完整設計思想。
2. 再看 [2026/09 README](./zh-TW-2026-09/README.md)，了解哪些部分現在應該改寫。
3. 實際導入時，以更新版的 `CLAUDE.md`、`settings.json`、Skills 與 Agents 當起點。
