#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || '.');
const nextTheme = process.argv[3] || '';
const extensions = new Set(['.css', '.scss', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.html', '.htm']);
const ignored = new Set(['node_modules', 'dist', 'build', '.git', '.workbuddy', 'coverage']);

const oldBlue = [
  '#1769ff', '#0a54d4', '#2364b9', '#eef5ff', '#dbe8ff', '#edf3fb', '#fbfdff',
  '#081f4f', '#8a9ab8', '#b7c4d8',
];
const oldClasses = [
  'app-blue-white-', 'business-page-', 'business-section-', 'business-primary-',
  'price-guide-', 'text-blue-', 'bg-blue-', 'border-blue-', 'ring-blue-',
];
const themeClasses = {
  'classic-blue-white': /(?:app-blue-white-|classic-blue-white|business-page-|business-primary-|business-section-)/i,
  'pixel-game': /(?:pixel-(?:login|hero|cloud|ground|tree|card|btn|badge|business)|pixel-game)/i,
  'cyber-neon': /(?:cyber(?:Canvas|-(?:dynamic|scanline|orb|neon))|cyber-neon)/i,
  'fresh-green': /(?:fresh-(?:dynamic|bg-orb|leaf|glass)|fresh-green)/i,
  'retro-y2k': /(?:y2k-(?:orb|star|chrome|bubble|card)|retro-y2k)/i,
  neomorphism: /(?:neo(?:morphic|morphism|-(?:card|button|input))|neomorphism)/i,
  claymorphism: /(?:clay-(?:card|icon|button|panel)|claymorphism)/i,
  'apple-minimal': /(?:apple-(?:hero|shell|card|nav)|apple-minimal)/i,
};
const semanticHints = [
  [/credit|coupon|discount|优惠|减/, '奖励金额 / 优惠权益'],
  [/link|href|复制链接|copy/, '链接 / 操作入口'],
  [/time|date|snapshot|history|历史|时间/, '时间 / 历史记录标识'],
  [/badge|tag|status|状态|类型|method|方式/, '状态 / 筛选标签'],
  [/button|btn|提交|保存|刷新|复制/, '操作按钮'],
];

function collect(current, result = []) {
  if (!fs.existsSync(current)) return result;
  const stat = fs.statSync(current);
  if (stat.isFile()) {
    if (extensions.has(path.extname(current).toLowerCase())) result.push(current);
    return result;
  }
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    collect(path.join(current, entry.name), result);
  }
  return result;
}

function hint(text) {
  for (const [pattern, label] of semanticHints) if (pattern.test(text)) return label;
  return '通用主题颜色 / 需人工确认';
}

const files = collect(target);
if (!files.length) {
  console.error(`FAIL  没有找到前端源码：${target}`);
  process.exit(2);
}

const findings = [];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    const matches = [];
    for (const color of oldBlue) if (lower.includes(color)) matches.push(color);
    for (const cls of oldClasses) if (lower.includes(cls)) matches.push(cls);
    if (matches.length) {
      findings.push({ file, line: index + 1, matches: [...new Set(matches)], text: line.trim(), semantic: hint(line) });
    }
  });
}

const knownThemes = Object.entries(themeClasses).filter(([, pattern]) => files.some((file) => pattern.test(fs.readFileSync(file, 'utf8')))).map(([id]) => id);
const output = {
  target,
  nextTheme: nextTheme || null,
  findingCount: findings.length,
  knownThemeSignatures: knownThemes,
  findings: findings.map((item) => ({
    file: path.relative(target, item.file) || path.basename(item.file),
    line: item.line,
    matches: item.matches,
    semantic: item.semantic,
    source: item.text,
  })),
};

console.log(JSON.stringify(output, null, 2));
console.log('');
if (!findings.length) {
  console.log('Result: PASS');
  process.exit(0);
}
console.log(`Result: AUDIT_REQUIRED (${findings.length})`);
console.log('说明：发现写死的旧主题颜色或旧主题 class。迁移完成后重新运行；只有残留为 0 才能通过主题交付。');
process.exit(1);
