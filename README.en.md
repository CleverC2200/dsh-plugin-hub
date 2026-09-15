# Company DSH Plugin Hub

Company fork of [DSH Plugin Hub](https://github.com/dshplugin/dsh-plugin-hub), retaining its MIT license and attribution.

The bundled catalog lists GEA, Agent Manage and the shared Agent workbench. Chinese and English use the same entries and statistics. Catalog requests never consult upstream catalogs or caches. Upstream self-update and promotional requests are disabled; no company release channel is claimed yet.

GEA one-click installation is disabled until its standard distribution is verified. Custom npm/Git installation remains available for user-authorized runtime plugins and requires the appropriate local tools and repository permissions. [Company resource suites](https://github.com/CleverC2200/company-agent-suites) are managed by Agent Manage, not installed as runtime plugins.

Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build`. The package includes prebuilt server/client files and the company catalog. Private repository consumers need their own read access; no maintainer credentials are shipped.

See [company desktop releases](docs/company/releases.md) for channels, private access and immutable updates owned by Electron. Business users do not enter server endpoints or model IDs.
