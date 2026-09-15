import test from 'node:test'
import assert from 'node:assert/strict'
import { validateReleaseChannel } from '../src/server/services/release-channel.ts'

test('a channel exposes an exact compatible plugin version and rejects a mismatched host', () => {
  const channel = { schema: 1, channel: 'stable', releases: [{
    package: '@cleverc2200/gea-dsh-prototype', version: '0.0.3',
    url: 'https://api.github.com/repos/CleverC2200/dsh-gea-plugin/releases/assets/123',
    sha256: 'a'.repeat(64), notes: { zh: '更新业务页', en: 'Update business page' },
    compatible: { dsh: ['0.1.5-rc.2'], workbench: ['0.1.1'], desktop: ['0.0.2'] },
  }] }
  const host = { dsh: '0.1.5-rc.2', workbench: '0.1.1', desktop: '0.0.2' }
  assert.equal(validateReleaseChannel(channel, 'stable', host).releases[0].version, '0.0.3')
  assert.throws(() => validateReleaseChannel(channel, 'stable', {...host, dsh:'9.0.0'}), /INCOMPATIBLE/)
  assert.throws(() => validateReleaseChannel(channel, 'test', host), /CHANNEL_MISMATCH/)
})

test('download rejects mismatched bytes without forwarding credentials to redirected storage', async t => {
  const {fetchReleasePackage} = await import('../src/server/services/release-channel.ts')
  const calls: Array<{url:string; auth:unknown}> = []
  t.mock.method(globalThis, 'fetch', async (url: string, options: RequestInit) => {
    calls.push({url,auth:(options.headers as Record<string,string>).Authorization})
    return calls.length === 1
      ? new Response(null,{status:302,headers:{location:'https://release-assets.githubusercontent.com/package.tgz?signature=test'}})
      : new Response('wrong package')
  })
  await assert.rejects(fetchReleasePackage({url:'https://api.github.com/repos/CleverC2200/dsh-plugin-hub/releases/assets/123',sha256:'0'.repeat(64)} as import('../src/server/services/release-channel.ts').Release,{token:'user-owned-token'}), /CHECKSUM_MISMATCH/)
  assert.equal(calls[0].auth,'Bearer user-owned-token')
  assert.equal(calls[1].auth,undefined)
})

test('an observed version cannot silently change its package digest', async () => {
  const {verifyReleaseHistory} = await import('../src/server/services/release-channel.ts')
  const release={package:'dsh-plugin',version:'1.4.3-company.2',sha256:'a'.repeat(64)}
  const channel={schema:1,channel:'test',releases:[release]} as import('../src/server/services/release-channel.ts').ReleaseChannel
  const history=verifyReleaseHistory(channel,{})
  assert.throws(()=>verifyReleaseHistory({...channel,releases:[{...release,sha256:'b'.repeat(64)}] as typeof channel.releases},history),/VERSION_REPLACED/)
})

test('missing assets fail explicitly and channels cannot embed credentials', async t => {
  const {downloadRelease} = await import('../src/server/services/release-channel.ts')
  t.mock.method(globalThis,'fetch',async()=>new Response(null,{status:404}))
  await assert.rejects(downloadRelease('https://api.github.com/repos/CleverC2200/x/releases/assets/1'),/RELEASE_HTTP_404/)
  await assert.rejects(downloadRelease('https://token@example.com/package.tgz'),/INVALID_RELEASE_URL/)
})

test('channel discovery requests GitHub JSON metadata before downloading the named channel asset', async t => {
 const {fetchCompanyChannel}=await import('../src/server/services/release-channel.ts')
 let count=0
 t.mock.method(globalThis,'fetch',async (_url: unknown,init:RequestInit)=>{
  count++
  if(count===1){assert.equal((init.headers as Record<string,string>).Accept,'application/vnd.github+json');return Response.json({assets:[{name:'stable.json',url:'https://api.github.com/repos/company/releases/assets/1'}]})}
  assert.equal((init.headers as Record<string,string>).Accept,'application/octet-stream')
  return Response.json({schema:1,channel:'stable',releases:[]})
 })
 assert.equal((await fetchCompanyChannel('https://api.github.com/repos/company/releases/tags/stable','stable',{dsh:'0.1.5-rc.2',workbench:'0.1.1',desktop:'0.0.2'})).channel,'stable')
 assert.equal(count,2)
})
