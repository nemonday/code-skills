const fs = require('fs');
const path = require('path');
const {
  resolveAll,
  generateCSSVariables,
  generateComponentStyles,
} = require('../generator');

const targetSrc = process.argv[2] ? path.resolve(process.argv[2]) : null;
const force = process.argv.includes('--force');

if (!targetSrc) {
  console.error('用法：node scripts/install-pixel-react-assets.js <项目src目录> [--force]');
  process.exit(1);
}

if (!fs.existsSync(targetSrc) || !fs.statSync(targetSrc).isDirectory()) {
  console.error(`目标 src 目录不存在：${targetSrc}`);
  process.exit(1);
}

const skillRoot = path.resolve(__dirname, '..');
const templatePath = path.join(skillRoot, 'templates', 'pixel-game.json');
const componentSource = path.join(skillRoot, 'references', 'react', 'PixelLoginScene.tsx');
const targetDir = path.join(targetSrc, 'beautify');
const targetComponent = path.join(targetDir, 'PixelLoginScene.tsx');
const targetCss = path.join(targetDir, 'pixel-game.css');
const marker = '/* Beautify pixel-game framework stylesheet v0.3.2-alpha */';

function assertWritable(filePath) {
  if (fs.existsSync(filePath) && !force) {
    console.error(`拒绝覆盖已有文件：${filePath}`);
    console.error('如确认覆盖，请追加 --force。');
    process.exit(2);
  }
}

assertWritable(targetComponent);
assertWritable(targetCss);
fs.mkdirSync(targetDir, { recursive: true });

const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const resolved = resolveAll(template, template.tokens);
const css = [
  marker,
  generateCSSVariables(resolved.tokens, resolved.cssVariables, '.beautify-root'),
  `\n/* Beautify - ${template.name} */`,
  generateComponentStyles(template.components, resolved, resolved.tokens, '.beautify-root'),
].join('\n');

fs.copyFileSync(componentSource, targetComponent);
fs.writeFileSync(targetCss, `${css}\n`, 'utf8');

console.log('PIXEL_REACT_ASSETS_INSTALLED');
console.log(`COMPONENT=${targetComponent}`);
console.log(`CSS=${targetCss}`);
console.log('NEXT_1=在入口文件导入 ./beautify/pixel-game.css');
console.log('NEXT_2=在 LoginPage.tsx 导入 PixelLoginScene 并用它包裹原表单');
console.log('NEXT_3=在应用根容器加入 beautify-root');
console.log('NEXT_4=执行 validate-pixel-theme.js，Result 必须为 PASS');
