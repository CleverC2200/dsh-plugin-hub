import { test } from 'node:test'
import assert from 'node:assert/strict'
import { companyCatalog } from '../src/server/services/company-catalog.ts'
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
