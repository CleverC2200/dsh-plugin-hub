/**
 * DSH Plugin Hub — the community plugin marketplace for DeepSeek Harness.
 * Website: https://dsh-plugin.org
 * GitHub: https://github.com/dshplugin/dsh-plugin-hub
 *
 * Section header: brand title row (H1 + open-site button) + tagline, followed
 * by the purple ad banner that promotes the catalog stats.
 */
import { createElement as h } from 'react'
import styles from '../../styles/Header.module.css'
import type { Translate } from '../../types.ts'

export function CatalogHeader({ t, langPath, statsTotal, statsVerified, onToggleLang, hubUpdate, onVersionClick, onAboutClick }: {
  t: Translate
  langPath: string
  statsTotal: number
  statsVerified: number
  onToggleLang: () => void
  /** Hub 自身是否有可用更新：有则版本号后紧跟红色「可更新」徽标（整体一个可点入口） */
  hubUpdate: boolean
  /** 点击版本号（含红色徽标，同一入口）：无论有无更新都打开更新记录弹窗 */
  onVersionClick: () => void
  /** 点击「关注我们」：打开平台介绍 + 用户反馈群二维码弹窗 */
  onAboutClick: () => void
}) {
  return h('header', { className: styles.companyHeader },
    h('h1', { className: styles.companyTitle }, t('companyTitle')),
    h('p', { className: styles.companyIntro }, t('companyIntro')),
    hubUpdate && h('button', { type: 'button', className: styles.versionBtn, onClick: onVersionClick }, t('updateAvailable')),
  )
}
