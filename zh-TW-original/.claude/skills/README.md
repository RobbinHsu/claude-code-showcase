# Claude Code Skills

此目錄包含專案專屬 skills，提供 Claude 這個 codebase 的領域知識與最佳實務。

## Skills 分類

### Code Quality & Patterns
| Skill | 說明 |
|-------|------|
| [testing-patterns](./testing-patterns/SKILL.md) | Jest testing、factory functions、mocking strategies、TDD workflow |
| [systematic-debugging](./systematic-debugging/SKILL.md) | 四階段 debugging methodology、root cause analysis |

### React & UI
| Skill | 說明 |
|-------|------|
| [react-ui-patterns](./react-ui-patterns/SKILL.md) | React patterns、loading states、error handling、GraphQL hooks |
| [core-components](./core-components/SKILL.md) | Design system components、tokens、component library |
| [formik-patterns](./formik-patterns/SKILL.md) | Form handling、validation、submission patterns |

### Data & API
| Skill | 說明 |
|-------|------|
| [graphql-schema](./graphql-schema/SKILL.md) | GraphQL queries、mutations、code generation |

## 常見 Task 的 Skill 組合

### 建立新 Feature
1. **react-ui-patterns** - Loading/error/empty states
2. **graphql-schema** - 建立 queries/mutations
3. **core-components** - UI implementation
4. **testing-patterns** - 寫 tests（TDD）

### 建立 Form
1. **formik-patterns** - Form structure 與 validation
2. **graphql-schema** - Submission mutation
3. **react-ui-patterns** - Loading/error handling

### Debug Issue
1. **systematic-debugging** - Root cause analysis
2. **testing-patterns** - 先寫 failing test

## Skills 如何運作

Claude 辨識出相關 context 時，skills 會自動被呼叫。每個 skill 提供：

- **When to Use** - 觸發條件
- **Core Patterns** - 最佳實務與 examples
- **Anti-Patterns** - 應避免的作法
- **Integration** - Skills 如何互相連接

## 新增 Skill

1. 建立目錄：`.claude/skills/skill-name/`
2. 新增 `SKILL.md`（case-sensitive）與 YAML frontmatter：
   ```yaml
   ---
   # 必填欄位
   name: skill-name              # 小寫、hyphens、最多 64 chars
   description: What it does and when to use it. Include trigger keywords.  # 最多 1024 chars

   # 選填欄位
   allowed-tools: Read, Grep, Glob    # 限制可使用 tools
   model: claude-sonnet-4-20250514    # 指定 model
   ---
   ```
3. 加入標準 sections：When to Use、Core Patterns、Anti-Patterns、Integration
4. 加入此 README
5. 把 triggers 加入 `.claude/hooks/skill-rules.json`

**重要：** `description` 欄位非常重要——Claude 會用 semantic matching 判斷何時套用 skill。請加入使用者自然會提到的 keywords。

## 維護

- Pattern 改變時更新 skills
- 移除 outdated information
- 新 pattern 出現時補上
- 讓 examples 與 codebase 保持同步
