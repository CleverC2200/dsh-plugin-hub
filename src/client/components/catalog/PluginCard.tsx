/**
 * DSH Plugin Hub — the community plugin marketplace for DeepSeek Harness.
 * Website: https://dsh-plugin.org
 * GitHub: https://github.com/dshplugin/dsh-plugin-hub
 *
 * One plugin card in the catalog list: name/category/verified badge,
 * description + topics, star/fork/date stats, and the detail/install/
 * uninstall actions.
 */
import { createElement as h } from 'react'
import styles from '../../styles/List.module.css'
import type { HubPlugin, LocaleId, Translate } from '../../types.ts'

export function PluginCard({ plugin: p, copied, installedName, installedVersion, hasUpdate, t, langKey, langPath, onInstall, onUninstall }: {
  plugin: HubPlugin
  copied: string | null
  installedName: (p: HubPlugin) => string | null
  /** 已安装版本号（安装时从目录信号记录；无 release 的仓库为空，无版本号可展示） */
  installedVersion: (p: HubPlugin) => string | null
  /** 已安装且目录有更新（有版本比版本、无版本比仓库更新时间） */
  hasUpdate: (p: HubPlugin) => boolean
  t: Translate
  langKey: LocaleId
  langPath: string
  /** 第二个参数标记「更新」（已安装目标的覆盖安装）：按钮/弹窗据此走更新语义 */
  onInstall: (p: HubPlugin, opts?: { update?: boolean }) => void
  onUninstall: (p: HubPlugin) => void
}) {
  const isInstalled = installedName(p) !== null
  const update = hasUpdate(p)
  const bundled = p.install?.webInstallable === false
  return h('article', { className: styles.companyRow },
    h('div', { className: styles.companyMain },
      h('h2', { className: styles.companyName }, p.displayName ?? p.slug),
      p.description && h('p', { className: styles.companyDesc }, p.description),
      bundled && h('span', { className: styles.companyStatus }, t('companyBundledHint')),
    ),
    h('div', { className: styles.companyActions },
      bundled ? h('span', { className: styles.companyStatus }, t('companyBundled'))
        : isInstalled && !update ? h('span', { className: styles.companyStatus }, t('installed'))
          : h('button', {
            type: 'button', className: styles.installBtn,
            onClick: () => onInstall(p, update ? { update: true } : undefined),
          }, t(update ? 'update' : 'install')),
    ),
  )
}
