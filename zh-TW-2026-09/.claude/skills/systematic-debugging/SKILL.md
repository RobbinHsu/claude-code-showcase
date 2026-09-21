---
name: systematic-debugging
description: 四階段 debugging methodology 與 root cause analysis。調查 bug、修 test failure、排查 unexpected behavior 時使用。強調「先找到 root cause，才能修」。
---

# Systematic Debugging

## 核心原則

**沒有先做 ROOT CAUSE INVESTIGATION，就不要開始修。**

不要用只處理 symptom 的 patch 掩蓋底層問題。嘗試修正之前，先理解問題為什麼發生。

## 四階段 Framework

### Phase 1：Root Cause Investigation

碰任何 code 之前：

1. **完整閱讀 error message** - 每個字都有意義
2. **穩定重現問題** - 不能重現，就無法驗證 fix
3. **檢查近期變更** - 問題開始前改了什麼？
4. **收集 diagnostic evidence** - Logs、stack traces、state dumps
5. **追 data flow** - 沿 call chain 找到錯誤 value 的來源

**Root Cause Tracing Technique：**
```
1. Observe the symptom - Where does the error manifest?
2. Find immediate cause - Which code directly produces the error?
3. Ask "What called this?" - Map the call chain upward
4. Keep tracing up - Follow invalid data backward through the stack
5. Find original trigger - Where did the problem actually start?
```

**關鍵原則：** 不要只在 error 出現的位置修；一定要追到 original trigger。

### Phase 2：Pattern Analysis

1. **找 working examples** - 找相似、但能正常運作的 code
2. **完整比較 implementations** - 不要只 skim
3. **找差異** - Working 與 broken 哪裡不同？
4. **理解 dependencies** - 這段 code 依賴什麼？

### Phase 3：Hypothesis and Testing

套用 scientific method：

1. **提出一個清楚 hypothesis** - 「error 發生是因為 X」
2. **設計最小測試** - 一次只改一個 variable
3. **預測結果** - Hypothesis 正確時應發生什麼？
4. **執行測試** - Execute and observe
5. **驗證結果** - 是否符合預測？
6. **迭代或繼續** - 猜錯就 refine hypothesis；猜對才 implement

### Phase 4：Implementation

1. **建立 failing test case** - 捕捉 bug behavior
2. **只做一個 fix** - 修 root cause，不修 symptom
3. **確認 test passes** - 證明 fix 有效
4. **跑完整 test suite** - 確認沒有 regression
5. **如果 fix 失敗，就 STOP** - 重新檢視 hypothesis

**關鍵規則：** 如果連續三次或更多 fix 都失敗，停止。這通常代表 architecture problem，需要討論，而不是繼續 patch。

## Red Flags - 流程違規

如果發現自己在想以下事情，立即停下：

- 「先 quick fix，之後再查」
- 「再試一個 fix」（已失敗多次之後）
- 「這應該會 work」（但不知道為什麼）
- 「我先試試看…」（沒有 hypothesis）
- 「我的 machine 可以」（沒有調查差異）

## 更深層問題的警訊

**連續 fix 不斷在不同區域暴露新問題**，通常表示 architecture issue：

- 停止 patch
- 記錄目前 findings
- 繼續前先和 team 討論
- 思考 design 是否需要重做

## 常見 Debugging 情境

### Test Failures

```
1. Read the FULL error message and stack trace
2. Identify which assertion failed and why
3. Check test setup - is the test environment correct?
4. Check test data - are mocks/fixtures correct?
5. Trace to the source of unexpected value
```

### Runtime Errors

```
1. Capture the full stack trace
2. Identify the line that throws
3. Check what values are undefined/null
4. Trace backward to find where bad value originated
5. Add validation at the source
```

### 「以前可以」

```
1. Use git bisect to find the breaking commit
2. Compare the change with previous working version
3. Identify what assumption changed
4. Fix at the source of the assumption violation
```

### Intermittent Failures

```
1. Look for race conditions
2. Check for shared mutable state
3. Examine async operation ordering
4. Look for timing dependencies
5. Add deterministic waits or proper synchronization
```

## Debugging Checklist

宣稱 bug 已修好之前：

- [ ] Root cause 已找出並記錄
- [ ] 已建立並測試 hypothesis
- [ ] Fix 處理 root cause，不是 symptom
- [ ] 已建立能重現 bug 的 failing test
- [ ] Fix 後 test 已通過
- [ ] 完整 test suite 通過
- [ ] 沒有使用「quick fix」合理化
- [ ] Fix 最小且聚焦

## Success Metrics

Systematic debugging 可達到約 95% first-time fix rate，相較 ad-hoc approach 約 40%。

做對時的跡象：
- Fix 不會創造新 bug
- 你能解釋 bug 為什麼發生
- 相似 bug 不會反覆出現
- Fix 後 code 變得更好，而不只是「能跑」

## 與其他 Skills 整合

- **testing-patterns**：修 bug 前先建立能重現 bug 的 test
