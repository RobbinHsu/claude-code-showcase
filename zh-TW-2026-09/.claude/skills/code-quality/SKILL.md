---
name: code-quality
description: 對指定目錄執行聚焦的 code quality review。
argument-hint: "[directory]"
disable-model-invocation: true
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(npm *) Bash(npx *)
---

# Code Quality Review

目標目錄：$ARGUMENTS

1. 找出相關 source files，排除 generated files。
2. 執行適用的 lint / typecheck。
3. 檢查 correctness、error handling、async race、security、unnecessary complexity。
4. 不為 style 而重構正常 code。
5. 輸出依 severity 排序的 findings。
6. 此 skill 預設只 review、不直接修改；要修正時回主 session 執行。
