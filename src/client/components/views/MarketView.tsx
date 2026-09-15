/**
 * DSH Plugin Hub — the community plugin marketplace for DeepSeek Harness.
 * Website: https://dsh-plugin.org
 * GitHub: https://github.com/dshplugin/dsh-plugin-hub
 *
 * Market view: the browse experience for the catalog — category tabs,
 * search/sort/install-state controls and the plugin list. Owns nothing;
 * it wires catalog state (query/sort/filter/category) to the small
 * presentational components so PluginHubSection stays free of view internals.
 */
import { createElement as h, Fragment } from 'react'
import type { HubPlugin, LocaleId } from '../../types.ts'
import type { useCatalog } from '../../hooks/useCatalog.ts'
import styles from '../../styles/Header.module.css'
import { CatalogList } from '../catalog/CatalogList.tsx'

type CatalogState = ReturnType<typeof useCatalog>

export function MarketView({ catalog, t, langPath, langKey, copied, resultText, onInstall, onUninstall, hasProxy, onOpenDiagnostics }: {
  catalog: CatalogState
  t: (key: string, params?: Record<string, string | number>) => string
  langPath: string
  langKey: LocaleId
  copied: string | null
  resultText: string | null
  onInstall: (p: HubPlugin, opts?: { update?: boolean }) => void
  onUninstall: (p: HubPlugin) => void
  hasProxy: boolean
  onOpenDiagnostics: () => void
}) {
  return h(Fragment, null,
    (catalog.total > 8 || catalog.query !== '') && h('input', {
      className: styles.companySearch, type: 'search', value: catalog.query,
      placeholder: t('companySearch'), 'aria-label': t('companySearch'),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => catalog.setQuery(e.target.value),
    }),
    h(CatalogList, {
      plugins: catalog.plugins,
      failed: catalog.failed,
      visible: catalog.visible,
      total: catalog.total,
      t,
      langPath,
      reload: catalog.reload,
      category: catalog.category,
      copied,
      installedName: catalog.installedName,
      installedVersion: catalog.installedVersion,
      hasUpdate: catalog.hasUpdate,
      langKey,
      onInstall,
      onUninstall,
      hasProxy,
      onOpenDiagnostics,
    }),
  )
}
