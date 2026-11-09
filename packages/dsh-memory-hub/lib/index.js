/**
 * dsh-memory-hub — host half.
 *
 * 提供记忆文件读写路由：
 *   GET  /plugins/dsh-memory-hub/api/list          全局 + 各工作区记忆元数据
 *   GET  /plugins/dsh-memory-hub/api/file?target=K 读取某个记忆文件
 *   PUT  /plugins/dsh-memory-hub/api/file          写入 { target, content }
 *
 * target 取值：
 *   - "global"                → $DSH_HOME/AGENTS.md（默认 ~/.dsh/AGENTS.md）
 *   - "<session 目录名>"       → 对应工作区根的 AGENTS.md
 *
 * 工作区发现：扫描 $DSH_HOME/sessions/ 的目录名。目录名是工作区路径的编码
 * （"/"→"-"，非 ASCII 字符→"~HEX~"，两端各包一层 "-"）。因为路径里的连字符
 * 和分隔符都编码成 "-"，解码时用文件系统验证做歧义消解（DFS 尝试每个 "-"
 * 是 "/" 还是字面连字符，选存在的路径）。
 */

import { homedir } from 'node:os'
import { join, dirname } from 'node:path'
import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'

export const name = 'dsh-memory-hub'
export const inject = []

const MAX_CONTENT = 2 * 1024 * 1024 // 单文件 2MB 上限
const MEMORY_FILE = 'AGENTS.md'

function dshHome() {
  const env = process.env.DSH_HOME
  if (typeof env === 'string' && env.trim()) return env.trim()
  return join(homedir(), '.dsh')
}

function globalMemoryPath() {
  return join(dshHome(), 'AGENTS.md')
}

function sessionsDir() {
  return join(dshHome(), 'sessions')
}

/** 把 "~HEX" 还原为字符（HEX 是 4 位 UTF-16 码元，如 课 = U+8BFE；"~" 是每个编码的前导分隔符）。 */
function decodeTildeEscapes(name) {
  return name.replace(/~([0-9A-Fa-f]{4})(?=[~-]|$)/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)).normalize('NFC')
  )
}

/**
 * 消解 "-" 的歧义：编码后 "/" 与字面 "-" 都变成 "-"。
 * DFS：在每个 "-" 处尝试「目录分隔」与「字面连字符」两种解释，
 * 用文件系统（中间目录必须存在）剪枝，返回存在的完整路径；找不到返回 null。
 */
function resolveEncodedPath(name) {
  const decoded = decodeTildeEscapes(name)
  const absolute = decoded.startsWith('/')
  const atoms = decoded.split('/').flatMap((seg) => seg.split('-'))
  if (absolute) atoms.shift() // 开头的 "/" 产生空串，丢掉
  // 会话目录名把开头的 "/" 也编码掉了（"--Users-…"），因此路径按绝对路径处理
  const exists = (p) => {
    try {
      return existsSync(p)
    } catch {
      return false
    }
  }

  // atoms[i..] 组装到 current 之下；merge = 当前 atom 与后续 atom 用字面 "-" 合并的个数
  function dfs(i, current) {
    if (i >= atoms.length) return exists('/' + current) ? '/' + current : null
    const last = atoms.length - 1
    for (let merge = 0; i + merge <= last; merge++) {
      const segment = atoms.slice(i, i + merge + 1).join('-')
      const path = current === '' ? segment : current + '/' + segment
      if (i + merge < last) {
        // 中间节点：目录必须存在才继续
        if (exists('/' + path)) {
          const hit = dfs(i + merge + 1, path)
          if (hit) return hit
        }
      } else if (exists('/' + path)) {
        return '/' + path
      }
    }
    return null
  }

  try {
    return dfs(0, '')
  } catch {
    return null
  }
}

async function listWorkspaces() {
  const out = []
  let names = []
  try {
    names = await readdir(sessionsDir())
  } catch {
    return out
  }
  for (const name of names) {
    if (!name.startsWith('--') || !name.endsWith('--')) continue
    const resolved = resolveEncodedPath(name.slice(2, -2))
    if (!resolved) {
      out.push({ key: name, label: name, path: null, exists: false })
      continue
    }
    let mtime = null
    try {
      mtime = (await stat(join(resolved, MEMORY_FILE))).mtimeMs
    } catch {
      /* 无记忆文件 */
    }
    out.push({ key: name, label: resolved, path: join(resolved, MEMORY_FILE), exists: Boolean(mtime) })
  }
  return out
}

async function readMemory(target) {
  let path
  if (target === 'global') {
    path = globalMemoryPath()
  } else {
    const resolved = resolveEncodedPath(target.slice(2, -2))
    if (!resolved) return { ok: false, error: '无法定位工作区路径' }
    path = join(resolved, MEMORY_FILE)
  }
  try {
    const content = await readFile(path, 'utf8')
    return { ok: true, path, content }
  } catch (error) {
    if (error.code === 'ENOENT') return { ok: true, path, content: '' }
    return { ok: false, error: String(error.message || error) }
  }
}

async function writeMemory(target, content) {
  if (typeof content !== 'string' || content.length > MAX_CONTENT) {
    return { ok: false, error: '内容为空或超过 2MB 上限' }
  }
  let path
  if (target === 'global') {
    path = globalMemoryPath()
  } else {
    const resolved = resolveEncodedPath(target.slice(2, -2))
    if (!resolved) return { ok: false, error: '无法定位工作区路径' }
    path = join(resolved, MEMORY_FILE)
  }
  try {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, content, 'utf8')
    return { ok: true, path }
  } catch (error) {
    return { ok: false, error: String(error.message || error) }
  }
}

/** 同源校验：跨站请求一律拒绝（防止任意网页改写本地记忆文件）。 */
function sameOrigin(req) {
  const site = req.headers['sec-fetch-site']
  if (site === undefined) return true // 非浏览器客户端（curl 等）放行
  return site === 'same-origin' || site === 'none'
}

function json(res, code, body) {
  const text = JSON.stringify(body)
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  })
  res.end(text)
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_CONTENT + 65536) throw new Error('body too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function createHandler() {
  return async function handler(req, res) {
    const url = new URL(req.url, 'http://local')
    const pathname = url.pathname
    try {
      if (pathname.endsWith('/api/list') && req.method === 'GET') {
        const workspaces = await listWorkspaces()
        let g = null
        try {
          g = (await stat(globalMemoryPath())).mtimeMs
        } catch {
          /* 尚无全局记忆 */
        }
        json(res, 200, {
          ok: true,
          global: { key: 'global', label: '全局记忆（所有会话生效）', exists: Boolean(g) },
          workspaces
        })
        return
      }
      if (pathname.endsWith('/api/file')) {
        if (!sameOrigin(req)) {
          json(res, 403, { ok: false, error: 'cross-origin request rejected' })
          return
        }
        if (req.method === 'GET') {
          const target = url.searchParams.get('target') || 'global'
          json(res, 200, await readMemory(target))
          return
        }
        if (req.method === 'PUT' || req.method === 'POST') {
          const body = await readBody(req)
          json(res, 200, await writeMemory(String(body.target || ''), String(body.content ?? '')))
          return
        }
      }
      json(res, 404, { ok: false, error: 'not found' })
    } catch (error) {
      json(res, 500, { ok: false, error: String((error && error.message) || error) })
    }
  }
}

export function apply(ctx) {
  ctx.effect(() => {
    const handler = createHandler()
    let disposer = null
    let attempts = 0
    const registerNow = () => {
      let ws = null
      try {
        ws = typeof ctx.get === 'function' ? ctx.get('webServer') : null
      } catch {
        /* headless 宿主没有 webServer */
      }
      if (!ws || typeof ws.register !== 'function') return false
      disposer = ws.register({
        kind: 'exact',
        path: '/plugins/dsh-memory-hub/api/list',
        handler
      })
      // file 路由带查询串，宿主 exact 匹配可能吃不到 query，
      // 所以两条路径都注册同一个 handler（handler 内部自行解析）。
      try {
        const d2 = ws.register({
          kind: 'exact',
          path: '/plugins/dsh-memory-hub/api/file',
          handler
        })
        const prev = disposer
        disposer = () => {
          try {
            d2()
          } catch {}
          try {
            prev()
          } catch {}
        }
      } catch {
        /* file 路由注册失败则只能用 list */
      }
      return true
    }
    if (registerNow()) {
      return () => {
        if (disposer) {
          try {
            disposer()
          } catch {}
        }
      }
    }
    const timer = setInterval(() => {
      attempts++
      if (registerNow() || attempts >= 20) clearInterval(timer)
    }, 500)
    return () => {
      if (timer !== null) clearInterval(timer)
      if (disposer) {
        try {
          disposer()
        } catch {}
      }
    }
  }, 'memory-hub: api routes')
}
