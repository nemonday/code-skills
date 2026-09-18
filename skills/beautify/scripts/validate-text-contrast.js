#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || '.');
const theme = process.argv[3] || '';
const text = fs.existsSync(target) && fs.statSync(target).isFile()
  ? fs.readFileSync(target, 'utf8')
  : '';

function hexToRgb(value) {
  const match = String(value).trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return null;
  const raw = match[1].length === 3 ? match[1].split('').map((v) => v + v).join('') : match[1];
  return [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
}
function luminance(rgb) {
  return rgb.map((v) => v / 255).map((v) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}
function contrast(a, b) {
  const rgbA = hexToRgb(a); const rgbB = hexToRgb(b);
  if (!rgbA || !rgbB) return null;
  const la = luminance(rgbA); const lb = luminance(rgbB);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function variable(name) {
  const match = text.match(new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+)`, 'i'));
  return match ? match[1].trim() : null;
}
function firstHex(value) {
  const match = value && value.match(/#[0-9a-f]{3,6}/i);
  return match ? match[0] : null;
}

let failures = 0;
function check(condition, pass, fail) {
  if (condition) console.log(`PASS  ${pass}`);
  else { failures += 1; console.log(`FAIL  ${fail}`); }
}

if (!text) {
  console.error(`FAIL  需要传入生成后的单文件 HTML/CSS：${target}`);
  process.exit(2);
}

const bg = firstHex(variable('--bg-page')) || firstHex(variable('background'));
const primary = firstHex(variable('--text-primary'));
const muted = firstHex(variable('--text-muted'));
const onDark = firstHex(variable('--text-on-dark'));
const onLight = firstHex(variable('--text-on-light'));
const placeholder = firstHex(variable('--text-placeholder'));
const darkTheme = theme === 'cyber-neon' || (bg && ['#080c14', '#0d121f', '#131929'].includes(bg.toLowerCase()));

check(Boolean(bg), `检测到背景色 ${bg || '未知'}`, '未检测到主题背景色');
check(Boolean(primary), `检测到正文文字色 ${primary || '未知'}`, '未检测到 --text-primary');
check(Boolean(muted), `检测到次要文字色 ${muted || '未知'}`, '未检测到 --text-muted');
check(Boolean(onDark) && Boolean(onLight), '检测到深色/浅色表面专用文字色', '缺少 --text-on-dark 或 --text-on-light');
check(Boolean(placeholder), '检测到占位符文字色', '缺少 --text-placeholder');

if (bg && primary) {
  const ratio = contrast(bg, primary);
  check(ratio !== null && ratio >= 4.5, `正文对比度 ${ratio ? ratio.toFixed(2) : '未知'}:1`, `正文对比度不足：${ratio ? ratio.toFixed(2) : '未知'}:1`);
}
if (bg && muted) {
  const ratio = contrast(bg, muted);
  check(ratio !== null && ratio >= 3, `次要文字对比度 ${ratio ? ratio.toFixed(2) : '未知'}:1`, `次要文字对比度不足：${ratio ? ratio.toFixed(2) : '未知'}:1`);
}
if (darkTheme) {
  check(Boolean(onDark) && contrast(bg, onDark) >= 4.5, '暗背景使用浅色文字', '暗背景没有足够对比度的浅色文字');
} else {
  check(Boolean(onLight) && contrast(bg, onLight) >= 4.5, '浅背景使用深色文字', '浅背景没有足够对比度的深色文字');
}

check(/color:\s*var\(--text-primary\)/i.test(text), '正文选择器使用主题文字变量', '正文没有使用主题文字变量');
check(/::placeholder[^{]*\{[^}]*color:\s*var\(--text-placeholder\)/is.test(text), 'placeholder 使用主题文字变量', 'placeholder 没有使用主题文字变量');
console.log(`\nResult: ${failures === 0 ? 'PASS' : `FAIL (${failures})`}`);
process.exit(failures === 0 ? 0 : 1);
