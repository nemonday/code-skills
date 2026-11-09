/* global window, document */
/**
 * dsh-memory-hub — client half.
 *
 * 以原生方式嵌入 DSH：侧边栏导航区注册一个「记忆区」图标行（sidebar.panellist），
 * 主区域注册对应的全局面板（main keyed slot），点击图标即在主区域打开——
 * 与工作区 / 设置面板同一套布局框架，不是悬浮窗。
 *
 * 面板内容：左侧记忆列表（总记忆 + 各工作区 AGENTS.md），右侧编辑器，保存即写盘。
 */
window.__ModuleLoader__.load({
  id: 'dsh-memory-hub',
  factory: (require) => {
    const React = require('react')
    const { useState, useEffect, useCallback } = React

    const API = '/plugins/dsh-memory-hub/api'
    const PANEL_ID = 'memory-hub'
    const STYLE_ID = 'dsh-memory-hub-style'

    const CSS = `
[data-panel="memory-hub"] {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  color: inherit;
  font-size: 13px;
}
.dsh-mh-body { display: flex; flex: 1; min-height: 0; }
.dsh-mh-side {
  flex: none; width: 240px; overflow: auto;
  border-right: 1px solid var(--dsw-border, rgba(128,128,128,.25));
  padding: 8px;
}
.dsh-mh-main { flex: 1; min-width: 0; display: flex; flex-direction: column; padding: 12px 16px; gap: 8px; }
.dsh-mh-section {
  font-size: 11px; letter-spacing: .04em; text-transform: uppercase;
  opacity: .6; padding: 6px 8px 4px;
}
.dsh-mh-item {
  display: flex; align-items: center; gap: 8px;
  width: 100%; text-align: left;
  padding: 6px 8px; border: none; border-radius: 8px; background: none;
  color: inherit; font-size: 12px; cursor: pointer;
}
.dsh-mh-item:hover { background: rgba(128,128,128,.14); }
.dsh-mh-item[data-active="true"] { background: var(--dsh-accent-soft, rgba(96,140,255,.18)); color: inherit; }
.dsh-mh-dot { flex: none; width: 7px; height: 7px; border-radius: 50%; background: #6b7280; }
.dsh-mh-dot[data-yes="true"] { background: #4ade80; }
.dsh-mh-dot[data-global="true"] { background: #8ab4ff; }
.dsh-mh-path { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dsh-mh-editor {
  flex: 1; min-height: 0; resize: none;
  border-radius: 10px; border: 1px solid var(--dsw-border, rgba(128,128,128,.3));
  background: var(--dsw-editor-bg, rgba(10,12,16,.35)); color: inherit;
  font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 10px 12px; outline: none;
}
.dsh-mh-editor:focus { border-color: var(--dsh-accent, rgba(96,140,255,.6)); }
.dsh-mh-foot { display: flex; align-items: center; gap: 10px; }
.dsh-mh-save {
  padding: 5px 16px; border-radius: 8px; border: none; cursor: pointer;
  background: var(--dsh-accent, #3b82f6); color: #fff; font-size: 12px; font-weight: 600;
}
.dsh-mh-save:disabled { opacity: .45; cursor: default; }
.dsh-mh-status { font-size: 11px; opacity: .65; }
.dsh-mh-status[data-ok="true"] { color: #4ade80; opacity: 1; }
.dsh-mh-status[data-ok="false"] { color: #f87171; opacity: 1; }
.dsh-mh-hint { font-size: 11px; opacity: .5; }
`

    function ensureStyle() {
      if (document.getElementById(STYLE_ID)) return
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = CSS
      document.head.appendChild(style)
    }

    async function fetchJSON(url, options) {
      const res = await fetch(url, options)
      return res.json()
    }

    /** 侧边栏导航图标（跟其他面板图标一样的 {size} 契约） */
    function MemoryHubIcon({ size }) {
      return React.createElement(
        'span',
        { style: { fontSize: Math.round((size || 16) * 0.9), lineHeight: 1 }, role: 'img', 'aria-label': '记忆区' },
        '🧠'
      )
    }

    function MemoryHubPage() {
      const [items, setItems] = useState(null)
      const [activeKey, setActiveKey] = useState(null)
      const [activeLabel, setActiveLabel] = useState('')
      const [content, setContent] = useState('')
      const [dirty, setDirty] = useState(false)
      const [status, setStatus] = useState(null)
      const [saving, setSaving] = useState(false)

      const loadList = useCallback(async () => {
        try {
          const data = await fetchJSON(API + '/list')
          if (!data.ok) throw new Error(data.error || 'list failed')
          return [Object.assign({ global: true }, data.global)].concat(data.workspaces || [])
        } catch (error) {
          setStatus({ ok: false, text: '加载列表失败：' + (error && error.message) })
          return []
        }
      }, [])

      const openEditor = useCallback(async (item) => {
        setActiveKey(item.key)
        setActiveLabel(item.label)
        setStatus(null)
        try {
          const data = await fetchJSON(API + '/file?target=' + encodeURIComponent(item.key))
          if (!data.ok) throw new Error(data.error || 'read failed')
          setContent(data.content)
        } catch (error) {
          setContent('')
          setStatus({ ok: false, text: '读取失败：' + (error && error.message) })
        }
        setDirty(false)
      }, [])

      useEffect(() => {
        let cancelled = false
        loadList().then((list) => {
          if (cancelled) return
          setItems(list)
          if (list.length) openEditor(list[0])
        })
        return () => {
          cancelled = true
        }
      }, [loadList, openEditor])

      const save = useCallback(async () => {
        if (!activeKey || saving) return
        setSaving(true)
        setStatus(null)
        try {
          const data = await fetchJSON(API + '/file', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ target: activeKey, content })
          })
          if (!data.ok) throw new Error(data.error || 'write failed')
          setStatus({ ok: true, text: '已保存，agent 下一次请求即生效' })
          setDirty(false)
          loadList().then(setItems)
        } catch (error) {
          setStatus({ ok: false, text: '保存失败：' + (error && error.message) })
        } finally {
          setSaving(false)
        }
      }, [activeKey, content, saving, loadList])

      const globals = (items || []).filter((i) => i.global)
      const workspaces = (items || []).filter((i) => !i.global)

      return React.createElement(
        'div',
        { 'data-panel': PANEL_ID },
        React.createElement(
          'div',
          { className: 'dsh-mh-body' },
          React.createElement(
            'div',
            { className: 'dsh-mh-side' },
            React.createElement('div', { className: 'dsh-mh-section' }, '总记忆'),
            globals.map((item) =>
              React.createElement(
                'button',
                {
                  key: item.key,
                  className: 'dsh-mh-item',
                  'data-active': activeKey === item.key,
                  onClick: () => openEditor(item),
                  title: item.label
                },
                React.createElement('span', { className: 'dsh-mh-dot', 'data-yes': String(item.exists), 'data-global': 'true' }),
                React.createElement('span', { className: 'dsh-mh-path' }, '全局 AGENTS.md')
              )
            ),
            React.createElement('div', { className: 'dsh-mh-section' }, '工作区记忆'),
            (workspaces || []).map((item) =>
              React.createElement(
                'button',
                {
                  key: item.key,
                  className: 'dsh-mh-item',
                  'data-active': activeKey === item.key,
                  onClick: () => openEditor(item),
                  title: item.label
                },
                React.createElement('span', { className: 'dsh-mh-dot', 'data-yes': String(item.exists) }),
                React.createElement('span', { className: 'dsh-mh-path' }, item.label)
              )
            ),
            items === null && React.createElement('div', { className: 'dsh-mh-hint', style: { padding: '6px 8px' } }, '加载中…')
          ),
          React.createElement(
            'div',
            { className: 'dsh-mh-main' },
            React.createElement('textarea', {
              className: 'dsh-mh-editor',
              value: content,
              spellCheck: false,
              placeholder: activeKey
                ? '尚无记忆文件 — 写下内容点「保存」即创建。AGENTS.md 会在每次请求自动注入给 agent。'
                : '从左侧选择一条记忆。',
              onChange: (event) => {
                setContent(event.target.value)
                setDirty(true)
              }
            }),
            React.createElement(
              'div',
              { className: 'dsh-mh-foot' },
              React.createElement(
                'span',
                {
                  style: { fontSize: 11, opacity: 0.6, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                },
                (activeLabel || '') + (dirty ? ' · 未保存' : '')
              ),
              status && React.createElement('span', { className: 'dsh-mh-status', 'data-ok': String(status.ok === true) }, status.text),
              React.createElement(
                'button',
                { className: 'dsh-mh-save', disabled: saving || !dirty || !activeKey, onClick: save },
                saving ? '保存中…' : '保存'
              )
            )
          )
        )
      )
    }

    function apply(ctx) {
      ensureStyle()
      // 侧边栏导航行（原生样式，与工作区 / 设置面板同一列）
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: PANEL_ID, order: 5, label: () => '记忆区', registrant: 'dsh-memory-hub' },
          MemoryHubIcon
        )
      )
      // 主区域全局面板
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: PANEL_ID, registrant: 'dsh-memory-hub' }, MemoryHubPage)
      )
    }

    return { apply, inject: ['slots'] }
  }
})
