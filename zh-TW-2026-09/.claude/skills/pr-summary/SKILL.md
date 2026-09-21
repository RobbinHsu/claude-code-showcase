---
name: pr-summary
description: 根據目前 branch 相對 main 的 changes 產生 pull request summary。
disable-model-invocation: true
allowed-tools: Bash(git *)
---

# PR Summary

1. 執行：
   - `git log main..HEAD --oneline`
   - `git diff main...HEAD --stat`
   - `git diff main...HEAD`
2. 只摘要實際 changes。
3. 輸出：
   - Summary
   - Significant Changes
   - Breaking Changes（若無則省略）
   - Test Plan
4. 不聲稱未執行的 test 已通過。
