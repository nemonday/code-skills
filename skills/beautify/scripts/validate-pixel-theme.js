const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || process.cwd());
const textExtensions = new Set(['.html', '.css', '.scss', '.sass', '.less', '.js', '.jsx', '.ts', '.tsx', '.vue']);
const ignoredDirectories = new Set(['node_modules', 'dist', 'build', '.git', '.workbuddy', 'coverage']);

function collectFiles(target, result = []) {
  if (!fs.existsSync(target)) return result;
  const stats = fs.statSync(target);
  if (stats.isFile()) {
    if (textExtensions.has(path.extname(target).toLowerCase())) result.push(target);
    return result;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const fullPath = path.join(target, entry.name);
    if (entry.isDirectory()) collectFiles(fullPath, result);
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) result.push(fullPath);
  }
  return result;
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

const files = collectFiles(root);
const corpus = files.map((file) => ({ file, text: fs.readFileSync(file, 'utf8') }));
const joined = corpus.map(({ text }) => text).join('\n');
const structuralJoined = corpus
  .filter(({ file }) => path.extname(file).toLowerCase() !== '.css')
  .map(({ text }) => text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''))
  .join('\n');
const cssJoined = corpus
  .filter(({ file }) => path.extname(file).toLowerCase() === '.css')
  .map(({ text }) => text)
  .join('\n');
const legacyVisualSource = `${structuralJoined}\n${(cssJoined.match(/--glass-[\w-]+\s*:[^;]+;/g) || []).join('\n')}`;

const checks = [
  ['作用域根节点', /beautify-root/, true, structuralJoined],
  ['像素登录场景', /pixel-login-scene/, true, structuralJoined],
  ['像素云层', /clouds-layer/, true, structuralJoined],
  ['像素云', /pixel-cloud/, true, structuralJoined],
  ['像素地面', /pixel-ground-bar/, true, structuralJoined],
  ['业务安全区', /pixel-business-safe-zone/, true, structuralJoined],
  ['属性卡', /stat-card/, true, structuralJoined],
  ['Quest 或 HP/EXP', /steps-wrap|quest|\bHP\b|\bEXP\b|progress-bar/i, true, structuralJoined],
  ['旧玻璃与大圆角残留', /rounded-(?:2xl|3xl|full)|backdrop-blur-|\bblur-(?:sm|md|lg|xl|2xl|3xl)\b|shadow-2xl|--glass-/, false, legacyVisualSource],
];

let failed = 0;
console.log(`Pixel-game validation: ${root}`);
console.log(`Scanned files: ${files.length}\n`);

for (const [label, pattern, expected, source] of checks) {
  const present = pattern.test(source);
  const passed = expected ? present : !present;
  if (!passed) failed += 1;
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}${expected ? '' : '（应清理或逐项确认）'}`);
}

const rootBlocks = countMatches(joined, /:root\s*\{/g);
if (rootBlocks > 1) {
  failed += 1;
  console.log(`FAIL  检测到 ${rootBlocks} 个 :root 块，请检查旧主题 Token 后置覆盖`);
} else {
  console.log(`PASS  :root 数量检查（${rootBlocks}）`);
}

const cloudCount = countMatches(structuralJoined, /className\s*=\s*["'][^"']*pixel-cloud\b|class\s*=\s*["'][^"']*pixel-cloud\b/g);
if (cloudCount < 2) {
  failed += 1;
  console.log(`FAIL  实际像素云节点不足 2 个（当前 ${cloudCount}）`);
} else {
  console.log(`PASS  实际像素云节点数量（${cloudCount}）`);
}

const legacyThemeNames = countMatches(structuralJoined, /app-blue-white-(?:shell|header)|login-shell-(?:card|hero)/g);
if (legacyThemeNames > 0) {
  failed += 1;
  console.log(`FAIL  仍有 ${legacyThemeNames} 处旧主题结构命名，说明 JSX 未完成主题迁移`);
} else {
  console.log('PASS  未发现旧主题结构命名');
}

const globalSelectors = corpus
  .filter(({ file }) => path.extname(file).toLowerCase() === '.css')
  .flatMap(({ text }) => text.match(/(?:^|\})\s*(?:\*|button|input|table|body)\s*(?::[^,{]+)?\s*\{/gm) || []);
if (globalSelectors.length > 0) {
  failed += 1;
  console.log(`FAIL  检测到 ${globalSelectors.length} 处未限定作用域的全局选择器`);
} else {
  console.log('PASS  未发现高风险全局选择器');
}

const decorationRules = corpus.filter(({ text }) => /pixel-cloud|pixel-tree|pixel-hero-character/.test(text));
const pointerSafe = decorationRules.some(({ text }) => /pointer-events\s*:\s*none/.test(text));
if (!pointerSafe) {
  failed += 1;
  console.log('FAIL  未确认像素装饰层 pointer-events:none');
} else {
  console.log('PASS  装饰层不拦截鼠标');
}

console.log(`\nResult: ${failed === 0 ? 'PASS' : `FAIL (${failed})`}`);
process.exitCode = failed === 0 ? 0 : 1;
