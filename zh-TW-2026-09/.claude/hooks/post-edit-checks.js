#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const path = require('node:path');

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

  const filePath = event?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const ext = path.extname(filePath).toLowerCase();
  const isJsTs = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);
  if (!isJsTs) process.exit(0);

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const notes = [];

  const prettier = spawnSync(npx, ['prettier', '--check', filePath], {
    cwd: root,
    encoding: 'utf8',
    timeout: 120000,
  });
  if (prettier.status !== 0) {
    notes.push(`Prettier 檢查失敗：${filePath}`);
  }

  if (ext === '.ts' || ext === '.tsx') {
    const typecheck = spawnSync(npx, ['tsc', '--noEmit'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 240000,
    });
    if (typecheck.status !== 0) {
      const summary = (typecheck.stdout || typecheck.stderr || '')
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(0, 12)
        .join('\n');
      notes.push(`TypeScript type-check 發現問題：\n${summary}`);
    }
  }

  if (/\.test\.(js|jsx|ts|tsx)$/.test(filePath)) {
    const tests = spawnSync(npm, ['test', '--', '--findRelatedTests', filePath, '--passWithNoTests'], {
      cwd: root,
      encoding: 'utf8',
      timeout: 240000,
    });
    if (tests.status !== 0) {
      notes.push(`相關測試未通過：${filePath}`);
    }
  }

  if (notes.length > 0) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: notes.join('\n\n'),
      },
    }));
  }
});
