# Claude Code Settings 文件

## Environment Variables

- `INSIDE_CLAUDE_CODE`：「1」- 表示程式碼正在 Claude Code 內執行
- `BASH_DEFAULT_TIMEOUT_MS`：bash command 的預設 timeout（7 分鐘）
- `BASH_MAX_TIMEOUT_MS`：bash command 的最大 timeout

## Hooks

### UserPromptSubmit

- **Skill Evaluation**：分析 prompts 並建議相關 skills
  - **Script**：`.claude/hooks/skill-eval.sh`
  - **行為**：比對 keywords、file paths 與 patterns，以建議 skills

### PreToolUse

- **Main Branch 保護**：防止直接在 main branch 編輯（5 秒 timeout）
  - **觸發**：使用 Edit、MultiEdit 或 Write tools 編輯檔案之前
  - **行為**：位於 main branch 時阻止檔案修改，並建議建立 feature branch

### PostToolUse

1. **程式碼格式化**：自動 format JS/TS files（30 秒 timeout）
   - **觸發**：編輯 `.js`、`.jsx`、`.ts`、`.tsx` 後
   - **Command**：`npx prettier --write`（或 Biome）
   - **行為**：格式化程式碼；發現錯誤時顯示 feedback

2. **NPM Install**：package.json 變更後自動安裝（60 秒 timeout）
   - **觸發**：編輯 `package.json` 後
   - **Command**：`npm install`
   - **行為**：安裝 dependencies；安裝失敗時讓 edit 失敗

3. **Test Runner**：test file 變更後執行 tests（90 秒 timeout）
   - **觸發**：編輯 `.test.js`、`.test.jsx`、`.test.ts`、`.test.tsx` 後
   - **Command**：`npm test -- --findRelatedTests <file> --passWithNoTests`
   - **行為**：執行相關 tests 並顯示結果；不阻塞

4. **TypeScript Check**：type-check TS/TSX files（30 秒 timeout）
   - **觸發**：編輯 `.ts`、`.tsx` 後
   - **Command**：`npx tsc --noEmit`
   - **行為**：只顯示前幾個 errors；不阻塞

## Hook Response Format

```json
{
  "feedback": "Message to show",
  "suppressOutput": true,
  "block": true,
  "continue": false
}
```

## Hooks 中的 Environment Variables

- `$CLAUDE_TOOL_INPUT_FILE_PATH`：正在編輯的檔案
- `$CLAUDE_TOOL_NAME`：正在使用的 tool
- `$CLAUDE_PROJECT_DIR`：Project root directory

## Exit Codes

- `0`：成功
- `1`：Non-blocking error（顯示 feedback）
- `2`：Blocking error（僅 PreToolUse，會阻止 action）
