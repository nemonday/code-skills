#!/usr/bin/env node
/**
 * code-skills 一键安装（macOS / Linux / Windows 通用）
 *
 * 做两件事：
 *   1) skills/*  → 链接到 ~/.dsh/skills/（mac/linux 用 symlink，Windows 用 junction）
 *   2) packages/dsh-memory-hub → 注册为 DSH desktop profile 的 file: 依赖并安装
 *
 * 用法：node install.mjs
 * 选项：--profile <name>   默认 desktop
 *       --unlink           移除安装（反向操作）
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const args = process.argv.slice(2)
function argOf(flag) {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}
const UNLINK = args.includes('--unlink')
const PROFILE_NAME = argOf('--profile') || 'desktop'
const IS_WIN = process.platform === 'win32'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))
const dshHome = process.env.DSH_HOME && process.env.DSH_HOME.trim() ? process.env.DSH_HOME.trim() : path.join(os.homedir(), '.dsh')
const skillsDir = path.join(dshHome, 'skills')
const profileDir = path.join(dshHome, 'profiles', PROFILE_NAME)
const pluginDir = path.join(repoRoot, 'packages', 'dsh-memory-hub')

const log = (msg) => console.log('  ' + msg)
const die = (msg) => {
  console.error('✗ ' + msg)
  process.exit(1)
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

/** 建目录链接：win 用 junction（免管理员权限），其余用 symlink */
function linkDir(target, linkPath) {
  try {
    const st = fs.lstatSync(linkPath)
    if (st.isSymbolicLink() || (IS_WIN && isJunction(linkPath))) fs.unlinkSync(linkPath)
    else die(`目标已存在且不是链接：${linkPath}（请手动处理）`)
  } catch {
    /* 不存在，正常 */
  }
  fs.symlinkSync(target, linkPath, IS_WIN ? 'junction' : 'dir')
}

function isJunction(p) {
  try {
    return fs.readlinkSync(p) !== null && fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

/** 找可用的 pnpm：优先 DSH 自带 runtime，其次 PATH */
function findPnpm() {
  const candidates = []
  const runtimeRoot = path.join(dshHome, 'dsh-runtimes')
  try {
    for (const rt of fs.readdirSync(runtimeRoot)) {
      const base = path.join(runtimeRoot, rt, 'dependencies')
      candidates.push(
        IS_WIN
          ? path.join(base, 'pnpm', 'bin', 'pnpm.cjs')
          : path.join(base, 'pnpm', 'bin', 'pnpm.cjs')
      )
    }
  } catch {
    /* 没有 runtime 目录 */
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) return { cmd: process.execPath, args: [c] }
  }
  const global = IS_WIN ? 'pnpm.cmd' : 'pnpm'
  return { cmd: global, args: [] }
}

// ── 1. skills ────────────────────────────────────────────────
const skillsSrc = path.join(repoRoot, 'skills')
ensureDir(skillsDir)
const skillNames = fs
  .readdirSync(skillsSrc, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

console.log(UNLINK ? '移除 skills 链接…' : '安装 skills（链接到 ~/.dsh/skills/）…')
for (const name of skillNames) {
  const linkPath = path.join(skillsDir, name)
  if (UNLINK) {
    try {
      const st = fs.lstatSync(linkPath)
      if (st.isSymbolicLink() || isJunction(linkPath)) {
        fs.unlinkSync(linkPath)
        log(`已移除 ${name}`)
      }
    } catch {
      /* 不存在 */
    }
    continue
  }
  linkDir(path.join(skillsSrc, name), linkPath)
  log(`✓ ${name}`)
}

// ── 2. DSH 插件 ──────────────────────────────────────────────
console.log(UNLINK ? '从 profile 移除插件注册…' : `注册 DSH 插件到 profile「${PROFILE_NAME}」…`)
const pkgPath = path.join(profileDir, 'package.json')
if (!UNLINK && !fs.existsSync(pkgPath)) {
  die(`找不到 profile：${pkgPath}\n  （先启动一次 DSH Desktop 让它生成 profile，或用 --profile 指定名字）`)
}
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.dependencies = pkg.dependencies || {}
  pkg.dsh = pkg.dsh || { profile: { bundles: [] } }
  pkg.dsh.profile = pkg.dsh.profile || { bundles: [] }
  pkg.dsh.profile.bundles = pkg.dsh.profile.bundles || []

  if (UNLINK) {
    delete pkg.dependencies['dsh-memory-hub']
    pkg.dsh.profile.bundles = pkg.dsh.profile.bundles.filter((b) => b !== 'dsh-memory-hub')
  } else {
    const repoPathOnDisk = IS_WIN ? repoRoot : repoRoot
    pkg.dependencies['dsh-memory-hub'] =
      'file:' + (IS_WIN ? repoPathOnDisk.replace(/\\/g, '/') : repoPathOnDisk) + '/packages/dsh-memory-hub'
    if (!pkg.dsh.profile.bundles.includes('dsh-memory-hub')) pkg.dsh.profile.bundles.push('dsh-memory-hub')
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  if (UNLINK) {
    console.log('  已从 profile 移除（如需清理依赖目录可手动 pnpm install）')
  } else {
    console.log('  安装依赖（pnpm install）…')
    const pnpm = findPnpm()
    try {
      execFileSync(pnpm.cmd, [...pnpm.args, 'install'], { cwd: profileDir, stdio: 'inherit' })
      log('✓ dsh-memory-hub 已装入 profile')
    } catch {
      die('pnpm install 失败。可手动执行：cd ' + profileDir + ' && pnpm install')
    }
  }
}

console.log(
  UNLINK
    ? '\n卸载完成。'
    : '\n✅ 安装完成！重启 DSH Desktop（完整退出含托盘）后生效：\n   - 技能会出现在技能目录\n   - 侧边栏出现 🧠 记忆区面板'
)
