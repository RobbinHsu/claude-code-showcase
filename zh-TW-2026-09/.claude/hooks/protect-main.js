#!/usr/bin/env node

const { execFileSync } = require('node:child_process');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  let event;
  try {
    event = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  if (!['Edit', 'Write'].includes(event.tool_name)) {
    process.exit(0);
  }

  let branch = '';
  try {
    branch = execFileSync('git', ['branch', '--show-current'], {
      cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
      encoding: 'utf8',
    }).trim();
  } catch {
    process.exit(0);
  }

  if (branch === 'main' || branch === 'master') {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: '禁止直接修改 main/master branch。請先建立 feature branch 或使用 worktree。',
      },
    }));
  }
});
