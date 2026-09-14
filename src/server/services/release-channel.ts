/** Company release contract: exact compatibility, immutable package digests, no upstream fallback. */
import { createHash } from 'node:crypto'

export type HostVersions = { dsh: string; workbench: string; desktop: string }
export type Release = {
  package: string; version: string; url: string; sha256: string
  notes: { zh: string; en: string }
  compatible: { [K in keyof HostVersions]: string[] }
}
export type ReleaseChannel = { schema: 1; channel: 'stable' | 'test'; releases: Release[] }
const companies = new Set(['@cleverc2200/gea-dsh-prototype', '@cleverc2200/dsh-agent-workbench', 'dsh-plugin', 'dsh-agent-manage', 'dsh-agent-plugins-market'])
const version = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value) }
function sourceUrl(value: unknown): string {
  if (typeof value !== 'string') throw new Error('INVALID_RELEASE_URL')
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('INVALID_RELEASE_URL')
  return url.href
}
export function validateReleaseChannel(value: unknown, channel: string, host: HostVersions): ReleaseChannel {
  if (!record(value) || value.schema !== 1 || !Array.isArray(value.releases) || value.releases.length > 100) throw new Error('INVALID_RELEASE_CHANNEL')
  if (!['stable','test'].includes(channel) || value.channel !== channel) throw new Error('CHANNEL_MISMATCH')
  const seen = new Set<string>()
  const releases = value.releases.map((entry: unknown): Release => {
    if (!record(entry) || typeof entry.package !== 'string' || !companies.has(entry.package) || typeof entry.version !== 'string' || !version.test(entry.version) || typeof entry.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('INVALID_RELEASE')
    if (seen.has(entry.package)) throw new Error('DUPLICATE_RELEASE')
    seen.add(entry.package)
    if (!record(entry.notes) || typeof entry.notes.zh !== 'string' || typeof entry.notes.en !== 'string' || !record(entry.compatible)) throw new Error('INVALID_RELEASE_METADATA')
    for (const key of ['dsh','workbench','desktop'] as const) {
      const accepted = entry.compatible[key]
      if (!Array.isArray(accepted) || accepted.length === 0 || !accepted.every(v => typeof v === 'string' && version.test(v))) throw new Error('INVALID_COMPATIBILITY')
      if (!accepted.includes(host[key])) throw new Error('RELEASE_INCOMPATIBLE_' + key.toUpperCase())
    }
    return { package: entry.package, version: entry.version, url: sourceUrl(entry.url), sha256: entry.sha256, notes: entry.notes as Release['notes'], compatible: entry.compatible as Release['compatible'] }
  })
  return { schema: 1, channel: channel as ReleaseChannel['channel'], releases }
}

/** Authentication is caller-owned; it is sent only to the GitHub API, never to redirects. */
export async function downloadRelease(url: string, { token, signal, accept = 'application/octet-stream', maxBytes = 64 * 1024 * 1024 }: {token?: string; signal?: AbortSignal; accept?: string; maxBytes?: number} = {}): Promise<Uint8Array> {
  let target = sourceUrl(url)
  for (let redirects = 0; redirects < 4; redirects++) {
    const parsed = new URL(target)
    const response = await fetch(target, { signal: signal ?? AbortSignal.timeout(60000), redirect: 'manual', headers: { Accept: accept, ...(token && parsed.hostname === 'api.github.com' ? { Authorization: `Bearer ${token}` } : {}) } })
    if ([301,302,303,307,308].includes(response.status)) {
      const next = new URL(response.headers.get('location') ?? '', target)
      // Signed storage URLs can contain query parameters; never accept embedded user credentials.
      if (next.protocol !== 'https:' || next.username || next.password || !['release-assets.githubusercontent.com','objects.githubusercontent.com','api.github.com','github.com'].includes(next.hostname)) throw new Error('RELEASE_REDIRECT_REJECTED')
      target = next.href
      continue
    }
    if (!response.ok || !response.body) throw new Error('RELEASE_HTTP_' + response.status)
    const chunks: Uint8Array[] = []; let size = 0
    for await (const chunk of response.body) {
      size += chunk.length
      if (size > maxBytes) throw new Error('RELEASE_TOO_LARGE')
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }
  throw new Error('RELEASE_TOO_MANY_REDIRECTS')
}
export async function fetchReleasePackage(release: Release, options: Parameters<typeof downloadRelease>[1] = {}): Promise<Uint8Array> {
  const bytes = await downloadRelease(release.url, options)
  if (createHash('sha256').update(bytes).digest('hex') !== release.sha256) throw new Error('RELEASE_CHECKSUM_MISMATCH')
  return bytes
}

/** A client must never accept different bytes for a version it has already observed. */
export function verifyReleaseHistory(channel: ReleaseChannel, previous: Record<string,string>): Record<string,string> {
  const next = { ...previous }
  for (const release of channel.releases) {
    const key = release.package + '@' + release.version
    if (next[key] !== undefined && next[key] !== release.sha256) throw new Error('RELEASE_VERSION_REPLACED')
    next[key] = release.sha256
  }
  return next
}

/** A channel tag points to a mutable channel JSON, never mutable package bytes. */
export async function fetchCompanyChannel(tagUrl: string, channel: 'stable'|'test', host: HostVersions, options: Parameters<typeof downloadRelease>[1] = {}): Promise<ReleaseChannel> {
  const metadata = JSON.parse(Buffer.from(await downloadRelease(tagUrl, {...options,accept:'application/vnd.github+json',maxBytes:1024*1024})).toString()) as {assets?:{name?:string;url?:string}[]}
  const asset = metadata.assets?.find(entry => entry.name === channel+'.json')
  if (!asset?.url) throw Error('CHANNEL_ARTIFACT_MISSING')
  const value: unknown = JSON.parse(Buffer.from(await downloadRelease(asset.url,{...options,maxBytes:1024*1024})).toString())
  return validateReleaseChannel(value,channel,host)
}
