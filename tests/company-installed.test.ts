import { test } from 'node:test'
import assert from 'node:assert/strict'
import { companyCatalog } from '../src/server/services/company-catalog.ts'
import { normalize } from '../src/client/logic/normalize.ts'
import { installedNameOf, installedItemsOf } from '../src/client/logic/installed.ts'
import { installTargetOf } from '../src/client/logic/install-command.ts'

const packages = ['@cleverc2200/gea-dsh-prototype', 'dsh-agent-manage', '@cleverc2200/dsh-agent-workbench']
const catalog = (companyCatalog(false) as Record<string, unknown>[]).map(normalize)

test('desktop local archives are recognized as installed without version signals', () => {
  const installed = Object.fromEntries(packages.map((name, i) => [name, `file:packages/local-${i}.tgz`]))
  for (const [i, plugin] of catalog.entries()) assert.equal(installedNameOf(plugin, installed, {}), packages[i])
  const items = installedItemsOf(catalog, installed, {}, null, packages, packages)
  assert.equal(items.length, 3)
  assert.ok(items.every(item => item.plugin !== null && item.loaded))
})

test('desktop identity does not change installation source or claim absent/foreign packages', () => {
  for (const [i, plugin] of catalog.entries()) {
    assert.deepEqual(installTargetOf(plugin), { target: plugin.source?.repo, via: 'github' })
    assert.equal(installedNameOf(plugin, {}, {}), null)
    assert.equal(installedNameOf(plugin, { [packages[i]]: 'github:someone/other-plugin' }, {}), null)
  }
})
