---
description: 為目前 branch changes 產生摘要
allowed-tools: Bash(git:*)
---

# PR Summary

為目前 branch 產生 pull request summary。

## 指示

1. **分析 changes**：
   ```bash
   git log main..HEAD --oneline
   git diff main...HEAD --stat
   ```

2. **產生摘要**，內容包含：
   - 簡短說明改了什麼
   - Modified files 清單
   - Breaking changes（如果有）
   - Testing notes

3. **格式化成 PR body**：
   ```markdown
   ## Summary
   [1-3 bullet points describing the changes]

   ## Changes
   - [List of significant changes]

   ## Test Plan
   - [ ] [Testing checklist items]
   ```
