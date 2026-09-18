#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || '.');
const extensions = new Set(['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte']);
const ignored = new Set(['node_modules', 'dist', 'build', '.git', '.workbuddy', 'coverage']);
const capsulePattern = /rounded-(?:full|\[[^\]]+\]|pill)|rounded-full|pill|capsule|badge|tag|chip/i;
const interactivePattern = /href=|<a\b|<button\b|\bbutton\b|link|copy|复制|链接/i;
const classPattern = /(?:className|class)\s*=\s*["'`]([^"'`$]+)["'`]/gi;
const stylePattern = /(?:style|css|background|color|border|shadow|ring|text-|bg-|border-)[^\n]*/i;

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

function tagDelta(line) {
  const withoutStrings = line.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '');
  const opens = (withoutStrings.match(/<(?:div|section|article|main|header|footer|ul|li|form|button|a|label)\b/gi) || []).length;
  const closes = (withoutStrings.match(/<\/(?:div|section|article|main|header|footer|ul|li|form|button|a|label)\s*>/gi) || []).length;
  const selfClosing = (withoutStrings.match(/<[^>]+\/\s*>/g) || []).length;
  return Math.max(0, opens - closes - selfClosing);
}

const files = collect(target);
if (!files.length) {
  console.error(`FAIL  没有找到 HTML/JSX/Vue 源码：${target}`);
  process.exit(2);
}

const findings = [];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let depth = 0;
  lines.forEach((line, index) => {
    const matches = [...line.matchAll(classPattern)];
    for (const match of matches) {
      const classes = match[1].trim();
      const isCapsule = capsulePattern.test(classes);
      const isInteractive = interactivePattern.test(line) || interactivePattern.test(classes);
      if (!isCapsule && !isInteractive) continue;
      findings.push({
        file: path.relative(target, file) || path.basename(file),
        line: index + 1,
        depth,
        nested: depth > 0,
        kind: isInteractive ? 'interactive' : 'capsule',
        classes,
        source: line.trim(),
        requiresThemeMapping: stylePattern.test(line),
      });
    }
    depth = Math.max(0, depth + tagDelta(line));
  });
}

const nested = findings.filter((item) => item.nested);
const styledNested = nested.filter((item) => item.requiresThemeMapping);
const output = {
  target,
  componentCount: findings.length,
  nestedComponentCount: nested.length,
  nestedStyledComponentCount: styledNested.length,
  rule: '每一个嵌套胶囊、链接容器、按钮、Badge、Tag 和带颜色/背景/边框的子元素都必须单独完成主题映射。父级通过不代表子级通过。',
  components: findings,
};

console.log(JSON.stringify(output, null, 2));
console.log('');
if (!styledNested.length) {
  console.log('Result: PASS');
  process.exit(0);
}
console.log(`Result: AUDIT_REQUIRED (${styledNested.length} nested styled components)`);
console.log('说明：发现嵌套交互/胶囊元素。请逐层检查子元素的颜色、背景、边框、文字、hover、focus 和 active。');
process.exit(1);
