---
name: docs-sync
description: 檢查現有 documentation 是否因 code changes 而失真或過期。
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(git *)
---

# Documentation Sync

1. 檢查近期 code changes。
2. 找出與 changes 直接相關的 docs / README / code examples。
3. 只回報「現在已錯誤或會誤導」的文件。
4. 驗證 API signature、type、command、example 是否仍成立。
5. 不為了增加文件而增加文件。
6. 輸出需要更新的檔案與具體修改建議。
