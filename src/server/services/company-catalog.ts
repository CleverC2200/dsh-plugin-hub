/** Company-owned catalog; upstream network catalogs and caches are never consulted. */
import catalog from '../company-catalog.json' with { type: 'json' }

/** Return the catalog or statistics derived from the same entries. */
export function companyCatalog(stats: boolean): unknown {
  return stats ? { total: catalog.length, verified: 0 } : catalog
}
