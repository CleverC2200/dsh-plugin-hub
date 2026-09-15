/** Company-owned catalog; upstream network catalogs and caches are never consulted. */
import catalog from '../company-catalog.json' with { type: 'json' };
/** List and statistics share one source; unknown locales fall back to Chinese. */
export function companyCatalog(stats, lang = 'zh') {
    return stats ? { total: catalog.length, verified: 0 } : catalog.map(({ locales, ...entry }) => ({
        ...entry, ...(lang === 'en' ? locales.en : {}),
    }));
}
/** Catalog actions only accept a listed repository with completed distribution. */
export function companyInstallable(repo) {
    return catalog.some(entry => entry.source.repo.toLowerCase() === repo.toLowerCase() && entry.install.webInstallable);
}
