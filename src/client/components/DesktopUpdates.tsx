import { createElement as h, useEffect, useState } from 'react'
import styles from '../styles/DesktopUpdates.module.css'

type UpdateState = {
  desktop?: boolean
  capabilities?: { batchPrepare?: boolean }
  targets?: Array<{ package: string; version: string }>
  progress?: { completed: number; total: number; package: string }
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
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    let live = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    const refresh = async () => {
      try {
        const response = await fetch('/dsh-plugin-hub/desktop-updates', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) { if (live) { setLoaded(true); setUnavailable(true) } return }
        const next: UpdateState = await response.json()
        if (!live) return
        setState(next)
        setLoaded(true)
        setUnavailable(false)
        if (next.desktop) timer = setTimeout(() => void refresh(), ['downloading', 'installing', 'restarting'].includes(next.phase ?? '') ? 2000 : 15000)
      } catch { if (live) { setLoaded(true); setUnavailable(true); timer = setTimeout(() => void refresh(), 15000) } }
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
      if (action === 'check') setChecked(true)
    } catch { setError(say('更新未完成，请重试或联系技术支持。', 'Update could not finish. Retry or contact technical support.')) }
    finally { setBusy(false) }
  }
  if (!state.desktop) return h('p', { className: styles.empty, role: 'status' }, !loaded ? say('正在读取更新状态…', 'Loading update status…') : unavailable ? say('暂时无法获取更新状态，请重新打开此页面。', 'Update status is unavailable. Reopen this page to retry.') : say('请在 GEA 桌面客户端中检查软件更新。', 'Use the GEA desktop app to check for software updates.'))
  const phase = state.phase ?? 'idle'
  const activeUpdate = ['downloading', 'installing', 'pending', 'restarting'].includes(phase)
  const hasChecked = checked && !state.checking && !state.checkError
  const updates = (hasChecked || activeUpdate ? state.releases ?? [] : []).filter(release => state.current?.[release.package] !== release.version)
  const batch = state.capabilities?.batchPrepare === true
  const progress = state.progress ? ` (${state.progress.completed}/${state.progress.total})` : ''
  const running = busy || state.checking || ['downloading', 'installing', 'restarting'].includes(phase)
  const problem = error || state.checkError || state.error
  const labels: Record<string, string> = {
    downloading: say('正在下载更新', 'Downloading updates') + progress,
    installing: say('正在准备更新，可继续工作', 'Preparing updates; you can keep working') + progress,
    pending: say('更新已准备好，重启后生效', 'Update ready; restart to apply'),
    restarting: say('正在重启…', 'Restarting…'),
    failed: say('更新失败，已保留原版本', 'Update failed; previous version preserved'),
  }
  const summary = problem ? say('更新遇到问题', 'Update needs attention')
    : labels[phase] ?? (updates.length ? say(`${updates.length} 项更新可用`, `${updates.length} updates available`)
      : hasChecked ? say('已是最新版本', 'Up to date') : say('检查公司提供的新版本', 'Check for company updates'))
  const names: Record<string, string> = {
    '@cleverc2200/gea-dsh-prototype': say('GEA 业务工作台', 'GEA business workbench'),
    '@cleverc2200/dsh-agent-workbench': say('公共 Agent 工作台', 'Shared Agent workbench'),
    'dsh-plugin': say('公司插件', 'Company plugins'),
    'dsh-agent-manage': say('Agent 资源管理', 'Agent resources'),
  }
  return h('section', { className: styles.root, 'aria-label': say('桌面更新', 'Desktop updates'), 'data-desktop-updates': true },
    h('div', { className: styles.heading },
      h('div', null, h('strong', { role: 'status' }, summary), h('p', null, phase === 'pending' ? say('完成当前工作后，重启即可应用更新。', 'Restart to apply updates when you have finished your work.') : updates.length ? say('更新下载完成后，重启即可生效。', 'Updates take effect after downloading and restarting.') : say('有新版本时，会在这里提示。', 'New versions will appear here.'))),
      h('div', { className: styles.actions },
        h('button', { type: 'button', disabled: running, onClick: () => void action('check') }, state.checking ? say('检查中…', 'Checking…') : say('检查更新', 'Check for updates')),
        batch && updates.length > 0 && h('button', { type: 'button', className: styles.primary, disabled: running || phase === 'pending', onClick: () => void action('prepare', { all: true }) }, say('全部下载', 'Download all')),
      ),
    ),
    problem && h('p', { role: 'alert' }, error || say('请重试或联系技术支持，当前版本可继续使用。', 'Retry or contact technical support. Your current version remains available.')),
    !batch && updates.length > 1 && h('p', { className: styles.hint }, say('当前桌面版本仅支持逐项更新。升级桌面程序后可全部下载、统一重启。', 'Upgrade the desktop app to download all updates and restart once.')),
    updates.map(release => h('div', { key: release.package, className: styles.release },
      h('div', null, h('strong', null, names[release.package] ?? release.package), h('p', null, zh ? release.notes.zh : release.notes.en)),
      !batch && h('button', { type: 'button', disabled: running || phase === 'pending', onClick: () => void action('prepare', { package: release.package }) }, say('下载更新', 'Download update')),
    )),
    ['downloading', 'installing', 'pending'].includes(phase) && h('div', { className: styles.actions },
      h('button', { type: 'button', disabled: busy, onClick: () => void action('cancel') }, say('取消更新', 'Cancel update')),
      phase === 'pending' && h('button', { type: 'button', disabled: busy, onClick: () => void action('restart') }, say('重启并应用（会停止当前任务）', 'Restart and apply (stops current tasks)')),
    ),
  )
}
