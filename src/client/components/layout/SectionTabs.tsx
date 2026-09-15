/**
 * DSH Plugin Hub — the community plugin marketplace for DeepSeek Harness.
 * Website: https://dsh-plugin.org
 * GitHub: https://github.com/dshplugin/dsh-plugin-hub
 *
 * Primary navigation: a compact segmented control switching between the
 * four top-level sections — Market (browse), Installed (manage), Custom
 * (manual command installs) and Settings (network sources & preferences).
 * Kept visually distinct from the category chips so the hierarchy reads:
 * section → category → plugin.
 */
import { createElement as h } from 'react'
import styles from '../../styles/SectionTabs.module.css'
import { BellIcon } from '../ui/icons.tsx'

export type SectionView = 'updates' | 'market' | 'installed' | 'custom' | 'settings'

export function SectionTabs({ view, setView, installedCount, t, noticeCount, onOpenNotifications }: {
  view: SectionView
  setView: (value: SectionView) => void
  installedCount: number
  t: (key: string) => string
  /** 通知中心红圈计数（记录 + 进行中任务 + 待重启）；0 时不显示徽标 */
  noticeCount: number
  /** 点击打开通知中心 */
  onOpenNotifications: () => void
}) {
  return h('nav', { className: styles.root, 'aria-label': t('companyTitle') },
    view !== 'updates' && h('button', {
      type: 'button',
      className: styles.tab,
      onClick: () => setView('updates'),
    }, t('backToUpdates')),
    h('details', { className: styles.maintenance, 'data-active': view !== 'updates' },
      h('summary', null, t('maintenance')),
      h('div', { className: styles.maintenanceMenu },
        h('p', null, t('maintenanceHint')),
        h('button', { type: 'button', onClick: (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.closest('details')?.removeAttribute('open'); setView('installed') } }, t('componentStatus')),
        h('button', { type: 'button', onClick: (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.closest('details')?.removeAttribute('open'); setView('market') } }, t('viewMarket')),
        h('button', { type: 'button', onClick: (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.closest('details')?.removeAttribute('open'); setView('settings') } }, t('viewSettings')),
        h('button', { type: 'button', onClick: (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.closest('details')?.removeAttribute('open'); setView('custom') } }, t('viewCustom')),
      ),
    ),
    // 通知入口：设置在最后一个 tab 后边，靠右对齐 —— 铃铛 + 红底白字计数（内联跟在铃铛后，不悬浮）
    h('button', {
      type: 'button',
      className: styles.noticeBtn,
      onClick: onOpenNotifications,
      title: t('notificationsHint'),
      'aria-label': t('notificationsHint'),
    },
      h('span', { className: styles.noticeIcon }, h(BellIcon)),
      noticeCount > 0 ? h('span', { className: styles.noticeCount }, noticeCount > 99 ? '99+' : String(noticeCount)) : null),
  )
}
