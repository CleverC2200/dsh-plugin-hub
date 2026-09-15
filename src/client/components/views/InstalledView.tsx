import { createElement as h, useState } from 'react'
import type { InstalledItem } from '../../logic/installed.ts'
import { runtimeStatusLabel } from '../../logic/installed.ts'
import type { LocaleId, Translate } from '../../types.ts'
import styles from '../../styles/List.module.css'
import headerStyles from '../../styles/Header.module.css'

export function InstalledView({ items, t, langKey, platform, onOpenDetail, onReveal, onUpdate, onUninstall, onRestart }: {
  items: InstalledItem[]
  t: Translate
  langKey: LocaleId
  /** 宿主系统平台（node process.platform）：支持文件管理器定位（macOS / Linux）时行内显示打开目录按钮 */
  platform: string
  onOpenDetail: (item: InstalledItem) => void
  onReveal: (item: InstalledItem) => void
  /** 更新：仅目录插件且有更新时触发（自定义安装无目录信号可比） */
  onUpdate: (item: InstalledItem) => void
  onUninstall: (item: InstalledItem) => void
  /** 重启宿主：待重启条目行内按钮触发（装完未挂载的插件重启后生效） */
  onRestart: () => void
}) {
  const [query, setQuery] = useState('')
  // Desktop packages can be installed from local files without catalog metadata.
  // These labels affect presentation only; installation identity stays unchanged.
  const names: Record<string, string> = {
    '@cleverc2200/gea-dsh-prototype': langKey === 'en' ? 'GEA business workbench' : 'GEA 业务工作台',
    '@cleverc2200/dsh-agent-workbench': langKey === 'en' ? 'Shared Agent workbench' : 'Agent 公共工作台',
    'dsh-agent-manage': langKey === 'en' ? 'Agent resources' : 'Agent 资源管理',
  }
  const displayName = (item: InstalledItem) => item.plugin?.displayName ?? names[item.name] ?? item.name
  const q = query.trim().toLowerCase()
  const list = items.filter(item => !q || [displayName(item), item.name, item.plugin?.description].some(value => value?.toLowerCase().includes(q)))
  return h('div', { className: styles.body },
    (items.length > 8 || query !== '') && h('input', {
      type: 'search', className: headerStyles.companySearch, value: query,
      placeholder: t('installedSearch'), 'aria-label': t('installedSearch'),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    }),
    h('div', { className: styles.list },
      list.length === 0 && h('div', { className: styles.state },
        h('strong', null, t(items.length === 0 ? 'installedEmpty' : 'noResult')),
        h('p', null, t(items.length === 0 ? 'installedEmptyDesc' : 'noResultDesc'))),
      list.map(item => h('article', { key: item.name, className: styles.companyRow },
        h('div', { className: styles.companyMain },
          h('h2', { className: styles.companyName }, displayName(item)),
          item.plugin?.description && h('p', { className: styles.companyDesc }, item.plugin.description),
          h('span', { className: styles.companyStatus }, t(runtimeStatusLabel(item.runtimeStatus ?? 'unknown'))),
        ),
        h('div', { className: styles.companyActions },
          item.runtimeStatus === 'pending' && h('button', { type: 'button', className: styles.installBtn, onClick: onRestart }, t('restart')),
          item.hasUpdate && item.plugin && item.plugin.install?.webInstallable !== false && h('button', { type: 'button', className: styles.installBtn, onClick: () => onUpdate(item) }, t('update')),
          h('button', { type: 'button', className: styles.detailBtn, onClick: () => onOpenDetail(item) }, t('companyManage')),
        ),
      )),
    ),
  )
}
