#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || '.');
const expectedTheme = process.argv[3] || '';
const themeIds = [
  'classic-blue-white',
  'apple-minimal',
  'pixel-game',
  'fresh-green',
  'cyber-neon',
  'neomorphism',
  'retro-y2k',
  'claymorphism',
];
const extensions = new Set(['.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte']);
const ignored = new Set(['node_modules', 'dist', 'build', '.git', '.workbuddy', 'coverage']);

function collect(current, files = []) {
  if (!fs.existsSync(current)) return files;
  const stat = fs.statSync(current);
  if (stat.isFile()) {
    if (extensions.has(path.extname(current).toLowerCase())) files.push(current);
    return files;
  }
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    collect(path.join(current, entry.name), files);
  }
  return files;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

const files = collect(target);
if (!files.length) {
  console.error(`FAIL  没有找到可检查的前端文件：${target}`);
  process.exit(2);
}

const records = files.map((file) => ({ file, text: fs.readFileSync(file, 'utf8') }));
const joined = records.map(({ text }) => text).join('\n');
const declared = unique([
  ...[...joined.matchAll(/data-beautify(?:-theme)?=["']([\w-]+)["']/gi)].map((match) => match[1]),
  ...[...joined.matchAll(/beautify-theme-([\w-]+)/gi)].map((match) => match[1]),
]);
const scripts = unique([...joined.matchAll(/data-beautify-script=["']([\w-]+)["']/gi)].map((match) => match[1]));
const anchors = unique([...joined.matchAll(/data-beautify-anchor=["']([\w-]+)["']/gi)].map((match) => match[1]));
const knownFound = themeIds.filter((id) => new RegExp(`(?:data-beautify(?:-theme)?=["']${id}["']|beautify-theme-${id}|${id}\\.css)`, 'i').test(joined));
const signaturePatterns = {
  'classic-blue-white': /app-blue-white-|classic-blue-white\.css/i,
  'apple-minimal': /apple-(?:hero|shell|card|nav)|apple-minimal\.css/i,
  'pixel-game': /pixel-(?:login|hero|cloud|ground|tree|card|btn|badge|business)|pixel-game\.css/i,
  'fresh-green': /fresh-(?:dynamic|bg-orb|leaf|glass)|fresh-green\.css/i,
  'cyber-neon': /cyber(?:Canvas|-(?:dynamic|scanline|bg-orb|orb))|cyber-neon\.css/i,
  neomorphism: /neo(?:morphic|morphism|-(?:card|button|input))|neomorphism\.css/i,
  'retro-y2k': /y2k-(?:orb|star|chrome|bubble|card)|retro-y2k\.css/i,
  claymorphism: /clay-(?:card|icon|button|panel)|claymorphism\.css/i,
};
const signatureFound = themeIds.filter((id) => signaturePatterns[id].test(joined));

let failures = 0;
function check(condition, pass, fail) {
  if (condition) console.log(`PASS  ${pass}`);
  else {
    failures += 1;
    console.log(`FAIL  ${fail}`);
  }
}

check(declared.length <= 1, `主题声明唯一（${declared[0] || '未声明'}）`, `检测到多个主题声明：${declared.join(', ')}`);
check(knownFound.length <= 1, `工程仅激活一个 Beautify 主题（${knownFound[0] || '未识别'}）`, `检测到多个主题资产或导入：${knownFound.join(', ')}`);
check(signatureFound.length <= 1, `主题专属结构唯一（${signatureFound[0] || '未识别'}）`, `检测到多个主题的专属结构/class：${signatureFound.join(', ')}`);
check(scripts.length <= 1, `主题脚本唯一（${scripts[0] || '无'}）`, `检测到多个主题脚本：${scripts.join(', ')}`);
check(anchors.length <= 1, `主题锚点唯一（${anchors[0] || '无'}）`, `检测到多个主题锚点：${anchors.join(', ')}`);

if (expectedTheme) {
  check(
    declared.includes(expectedTheme) || knownFound.includes(expectedTheme),
    `当前主题与目标一致（${expectedTheme}）`,
    `未找到目标主题 ${expectedTheme} 的激活标记`,
  );
  check(
    scripts.every((id) => id === expectedTheme) && anchors.every((id) => id === expectedTheme),
    '脚本与锚点均属于当前主题',
    `存在非当前主题资产：scripts=${scripts.join(',') || '无'} anchors=${anchors.join(',') || '无'}`,
  );
  check(
    signatureFound.every((id) => id === expectedTheme),
    '未发现上一主题专属结构残留',
    `存在非当前主题专属结构/class：${signatureFound.filter((id) => id !== expectedTheme).join(', ')}`,
  );
}

const unmarkedCyber = /id=["']cyberCanvas["']|class=["'][^"']*\bcyber-(?:dynamic-bg|scanline)\b/i.test(joined);
check(
  !unmarkedCyber || expectedTheme === 'cyber-neon' || declared.includes('cyber-neon'),
  '未发现游离的赛博动态节点',
  '发现赛博 Canvas/扫描线残留，但当前主题不是 cyber-neon',
);

console.log(`\nResult: ${failures === 0 ? 'PASS' : `FAIL (${failures})`}`);
process.exit(failures === 0 ? 0 : 1);
