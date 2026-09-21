---
description: 從頭到尾處理一張 JIRA/Linear ticket
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git:*), Bash(gh:*), Bash(npm:*), mcp__jira__*, mcp__github__*, mcp__linear__*
---

# Ticket Workflow

處理 ticket：$ARGUMENTS

## 指示

### 1. 讀取 Ticket

先取得並理解 ticket：

```
使用 JIRA/Linear MCP tools：
- 取得 ticket details（title、description、acceptance criteria）
- 檢查 linked tickets 或 epics
- Review comments 或 attachments
```

摘要：
- 需要完成什麼
- Acceptance criteria
- 任何 blocker 或 dependency

### 2. 探索 Codebase

開始 coding 前：
- 搜尋相關 code
- 理解目前 implementation
- 找出需要修改的 files

### 3. 建立 Branch

```bash
git checkout -b {initials}/{ticket-id}-{brief-description}
```

### 4. 實作 Changes

- 遵循 project patterns（檢查相關 skills）
- 先寫 tests（TDD）
- 做 incremental commits

### 5. 更新 Ticket

工作過程：
- 加入 progress update comments
- 更新 status（In Progress → In Review）
- 記錄 blocker 或 question

### 6. 建立 PR 並連結

準備完成時：
- 用 `gh pr create` 建立 PR
- 將 PR 連到 ticket
- PR title 加上 ticket ID：`feat(PROJ-123): description`

### 7. 如果發現 Bug

工作途中若發現無關 bug：
1. 建立新 ticket 並附 details
2. 若相關，連到目前 ticket
3. 在 PR description 記錄
4. 繼續原本 task

## Workflow 範例

```
Me: /ticket PROJ-123

Claude:
1. Fetching PROJ-123 from JIRA...
   Title: Add user profile avatar upload
   Description: Users should be able to upload a profile picture...
   Acceptance Criteria:
   - [ ] Upload button on profile page
   - [ ] Support JPG/PNG up to 5MB
   - [ ] Show loading state during upload

2. Searching codebase for profile-related code...
   Found: src/screens/Profile/ProfileScreen.tsx
   Found: src/components/Avatar/Avatar.tsx

3. Creating branch: cw/PROJ-123-avatar-upload

4. [Implements feature with TDD approach]

5. Updating JIRA status to "In Review"...
   Adding comment: "Implementation complete, PR ready for review"

6. Creating PR and linking to PROJ-123...
   PR #456 created: feat(PROJ-123): add avatar upload to profile
```
