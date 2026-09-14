import { test } from 'node:test'
import assert from 'node:assert/strict'
import { companyCatalog, companyInstallable } from '../src/server/services/company-catalog.ts'
import { fetchHubAbout, fetchHubUpdate } from '../src/client/data/hub.ts'
import { normalize } from '../src/client/logic/normalize.ts'

test('company directory contains only owned repositories and keeps unready GEA install disabled', () => {
  const entries = companyCatalog(false) as Record<string, unknown>[]
  const normalized = entries.map(normalize)
  assert.deepEqual(normalized.map(p => p.source?.repo), ['CleverC2200/dsh-gea-plugin', 'CleverC2200/dsh-agent-manage', 'CleverC2200/dsh-agent-workbench'])
  assert.equal(normalized[0].install?.webInstallable, false)
  assert.deepEqual(companyCatalog(true), { total: 3, verified: 0 })
})

test('metadata never fetches upstream updates or promotional content', async t => {
  t.mock.method(globalThis, 'fetch', () => { throw new Error('unexpected network') })
  assert.equal(await fetchHubUpdate(), null)
  const about = await fetchHubAbout()
  assert.match(JSON.stringify(about), /CleverC2200\/company-agent-suites/)
  assert.doesNotMatch(JSON.stringify(about), /api\.dsh-plugin\.org/)
})

test('English and Chinese catalogs describe the same company plugins in the selected language', () => {
  const zh = companyCatalog(false, 'zh') as Array<{ source: { repo: string }; description: string }>
  const en = companyCatalog(false, 'en') as typeof zh
  assert.deepEqual(zh.map(p => p.source.repo), en.map(p => p.source.repo))
  assert.match(en[0].description, /GEA/)
  assert.doesNotMatch(en[0].description, /[\u3400-\u9fff]/)
  assert.notEqual(zh[0].description, en[0].description)
})

test('unready and non-company repositories cannot use catalog installation', () => {
  assert.equal(companyInstallable('CleverC2200/dsh-gea-plugin'), false)
  assert.equal(companyInstallable('upstream/plugin'), false)
  assert.equal(companyInstallable('CleverC2200/dsh-agent-workbench'), true)
})

test('company detail links point to the actual repository', async () => {
  const { pluginDetailUrl } = await import('../src/client/logic/urls.ts')
  const plugin = normalize((companyCatalog(false) as Record<string, unknown>[])[0])
  assert.equal(pluginDetailUrl(plugin, 'zh/'), 'https://github.com/CleverC2200/dsh-gea-plugin')
})
