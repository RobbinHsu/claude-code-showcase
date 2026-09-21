---
description: 檢查 documentation 是否與 code 同步
allowed-tools: Read, Glob, Grep, Bash(git:*)
---

# Documentation Sync

檢查 documentation 是否符合目前 code state。

## 指示

1. **尋找近期 code changes**：
   ```bash
   git log --since="30 days ago" --name-only --pretty=format: -- "*.ts" "*.tsx" | sort -u
   ```

2. **尋找相關 documentation**：
   - 搜尋 `/docs/` 中提到 changed code 的 files
   - 檢查 changed code 附近的 README files
   - 尋找 changed files 中的 TSDoc comments

3. **驗證 documentation 正確性**：
   - Code examples 還能運作嗎？
   - API signatures 正確嗎？
   - Prop types 有更新嗎？

4. **只回報真正的問題**：
   - Documentation 是 living document
   - 只標示「錯誤」內容，不是缺少內容
   - 不要為了文件而建議新增文件

5. **輸出需要更新的 documentation checklist**
