import { createElement as h, useEffect, useState } from 'react'
import styles from '../styles/DesktopUpdates.module.css'

type UpdateState = {
  desktop?: boolean
  phase?: string
  checking?: boolean
  checkError?: string | null
  error?: string | null
  lastCheck?: string
  current?: Record<string, string>
  releases?: Array<{ package: string; version: string; notes: { zh: string; en: string } }>
}

/** Optional desktop protocol. Web hosts without this endpoint render no update panel. */
export function DesktopUpdates({ lang }: { lang: string }) {
  const zh = lang.startsWith('zh')
  const say = (a: string, b: string) => zh ? a : b
  const [state, setState] = useState<UpdateState>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    let live = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    const refresh = async () => {
      try {
        const response = await fetch('/dsh-plugin-hub/desktop-updates', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) return
        const next: UpdateState = await response.json()
        if (!live) return
        setState(next)
        if (next.desktop) timer = setTimeout(() => void refresh(), ['downloading', 'installing', 'restarting'].includes(next.phase ?? '') ? 2000 : 15000)
      } catch { if (live) timer = setTimeout(() => void refresh(), 15000) }
    }
    void refresh()
    return () => { live = false; controller.abort(); clearTimeout(timer) }
  }, [])
  const action = async (action: string, value: unknown = {}) => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/dsh-plugin-hub/desktop-updates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, value }),
      })
      const result = await response.json()
      if (!response.ok || result.error) throw new Error(result.error ?? 'UPDATE_FAILED')
      const current = await fetch('/dsh-plugin-hub/desktop-updates', { cache: 'no-store' })
      if (!current.ok) throw new Error('UPDATE_FAILED')
      setState(await current.json())
    } catch { setError(say('更新未完成，请重试或联系技术支持。', 'Update could not finish. Retry or contact technical support.')) }
    finally { setBusy(false) }
  }
  if (!state.desktop) return null
  const updates = (state.releases ?? []).filter(release => state.current?.[release.package] !== release.version)
  const phase = state.phase ?? 'idle'
  const running = busy || state.checking || ['downloading', 'installing', 'restarting'].includes(phase)
  const problem = error || state.checkError || state.error
  const labels: Record<string, string> = {
    downloading: say('正在下载更新…', 'Downloading update…'),
    installing: say('正在准备更新，可继续工作', 'Preparing update; you can keep working'),
    pending: say('更新已准备好，重启后生效', 'Update ready; restart to apply'),
    restarting: say('正在重启…', 'Restarting…'),
    failed: say('更新失败，已保留原版本', 'Update failed; previous version preserved'),
  }
  const summary = problem ? say('更新遇到问题', 'Update needs attention')
    : labels[phase] ?? (updates.length ? say(`${updates.length} 项更新可用`, `${updates.length} updates available`)
      : state.lastCheck ? say('已是最新版本', 'Up to date') : say('检查公司提供的新版本', 'Check for company updates'))
  const names: Record<string, string> = {
    '@cleverc2200/gea-dsh-prototype': say('GEA 业务工作台', 'GEA business workbench'),
    '@cleverc2200/dsh-agent-workbench': say('公共 Agent 工作台', 'Shared Agent workbench'),
    'dsh-plugin': say('公司插件', 'Company plugins'),
    'dsh-agent-manage': say('Agent 资源管理', 'Agent resources'),
  }
  return h('section', { className: styles.root, 'aria-label': say('桌面更新', 'Desktop updates'), 'data-desktop-updates': true },
    h('div', { className: styles.heading },
      h('div', null, h('strong', null, say('桌面更新', 'Desktop updates')), h('p', { role: 'status' }, summary)),
      h('div', { className: styles.actions },
        h('button', { type: 'button', disabled: running, onClick: () => void action('check') }, state.checking ? say('检查中…', 'Checking…') : say('检查更新', 'Check for updates')),
        updates.length > 0 && h('button', { type: 'button', 'aria-expanded': expanded, onClick: () => setExpanded(!expanded) }, expanded ? say('收起', 'Collapse') : say('查看更新', 'View updates')),
      ),
    ),
    problem && h('p', { role: 'alert' }, error || say('请重试或联系技术支持，当前版本可继续使用。', 'Retry or contact technical support. Your current version remains available.')),
    expanded && updates.map(release => h('div', { key: release.package, className: styles.release },
      h('div', null, h('strong', null, names[release.package] ?? release.package), h('p', null, zh ? release.notes.zh : release.notes.en)),
      h('button', { type: 'button', disabled: running || phase === 'pending', onClick: () => void action('prepare', { package: release.package }) }, say('下载更新', 'Download update')),
    )),
    ['downloading', 'installing', 'pending'].includes(phase) && h('div', { className: styles.actions },
      h('button', { type: 'button', disabled: busy, onClick: () => void action('cancel') }, say('取消更新', 'Cancel update')),
      phase === 'pending' && h('button', { type: 'button', disabled: busy, onClick: () => void action('restart') }, say('重启并应用（会停止当前任务）', 'Restart and apply (stops current tasks)')),
    ),
  )
}
