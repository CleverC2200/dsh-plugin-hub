# Company desktop releases / 公司桌面发行

The company fork uses only the selected stable or test channel. Built plugin archives are downloaded, checked against SHA-256 and exact DSH/workbench/desktop compatibility, then handed to the Electron owner. The owner invokes the official DSH installer with bundled pnpm 11.19.0 in a new external graph. Live code, sessions and workspaces stay unchanged until the user clicks restart. Legacy in-place install/uninstall/restart paths cannot mutate desktop graphs.

公司桌面只消费选定的正式或测试渠道。检查不安装；准备完成等待明确重启。重复准备被拒绝，下载可取消，失败保留当前组合。新后端必须通过本地健康验证，失败回退已验证版本。自动检查开关和 1–168 小时间隔持久保存在用户目录；检查失败不回退上游源。

## Build and publish

- GEA: Node 24.14.1, `npm ci`, `npm run typecheck`, `npm run build`, `npm run package`. The package script enforces its allowlist and produces SHA-256 metadata. Publish in the private GEA repository, never in this public Hub repository.
- Workbench: Node 24.14.1, `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm pack --ignore-scripts`. Publish the prebuilt archive in its own repository.
- Hub: Node 24.14.1, `npm ci`, `npm run check`, `npm pack --ignore-scripts`. Publish the prebuilt archive in this repository after committing code and generated distributions.

Use a new version/tag for every changed archive. Never replace an already published package asset. A client records every observed `package@version` digest and rejects changed bytes for the same version. Channel pointers may advance; package bytes may not.

Each channel JSON has `schema: 1`, `channel: stable|test`, and `releases`. Each release contains `package`, exact `version`, HTTPS asset API `url`, lowercase hexadecimal `sha256`, bilingual `notes`, and `compatible` arrays for `dsh`, `workbench`, `desktop`. Missing assets, bad hashes, mismatched channels and incompatible versions fail explicitly. Compatibility is checked both at discovery and immediately before preparation.

Channel metadata is hosted in private GEA releases tagged `company-channel-stable` and `company-channel-test`, with assets `stable.json` and `test.json`. The desktop resolves metadata through the GitHub API then downloads the named asset. Updating a channel requires publishing immutable package releases first, calculating archive digests, uploading the new channel JSON, and verifying both channels from a fresh client.

## Private access / 私有访问

An administrator provisions a caller-owned GitHub token with read access to private GEA releases through the desktop launch environment `GEA_RELEASE_TOKEN`. No business endpoint/model form is presented. The token is never included in packages, channel manifests, persisted update state or logs, and is not passed to backend/install child processes. Only the Electron owner uses it; redirects to GitHub asset storage omit Authorization. Without access the UI reports the channel access failure and leaves the installed graph usable. Do not provision a maintainer's credential into another user's installation.

验收使用当前有权限用户的临时进程环境，在干净客户端验证私有发行包下载和校验；不把该临时授权写入交付物。同事安装的私有发行授权由管理员按用户配置。Windows 运行与凭据配置仍须 Windows 真机验收，macOS 测试不替代该项。

## Evidence

## Company Hub 1.4.3-company.6

The default settings page is Software updates. Component status, catalog and installation settings are under Technical maintenance. Check for updates and download actions align right; a successful check reveals available updates directly, without a View updates toggle. Existing pending updates remain visible when reopening the page.

Download all is enabled only when the desktop owner advertises `capabilities.batchPrepare`. Older owners retain individual downloads; installing this Hub alone does not add batch preparation to Electron. Batch owner changes are tracked separately from this plugin release.

Validation: client/server/test type checks, 84 passing tests (2 skipped), production build, and browser preview of initial check-only and checked-with-updates states.

GEA 0.0.2 → 0.0.3, workbench 0.1.1 unchanged, company Hub 1.4.3-company.2, official DSH 0.1.5-rc.2 / Electron 44.0.0: real market check, private download, immutable preparation, explicit Electron restart and rendered/current version agreement passed. Encrypted login bytes, an existing independent Agent session and workspace file survived. Tests live in GEA `desktop/market-update.test.mjs`; channel/credential/hash contract tests live in this repository's `tests/release-channel.test.ts`.
