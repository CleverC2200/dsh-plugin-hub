/** Local fork metadata; never checks upstream releases or promotional endpoints. */
import type { HubAboutInfo, HubUpdateInfo } from '../types.ts'

/** Self-update stays disabled until this fork has its own release channel. */
export async function fetchHubUpdate(): Promise<HubUpdateInfo | null> {
  return null
}

/** Company repository entry points, independent of upstream content. */
export async function fetchHubAbout(): Promise<HubAboutInfo | null> {
  return { content: {
    zh: '公司插件目录。\n\n[GEA](https://github.com/CleverC2200/dsh-gea-plugin) · [Agent Manage](https://github.com/CleverC2200/dsh-agent-manage) · [Agent 套件仓库](https://github.com/CleverC2200/company-agent-suites)\n\n套件仓库通过 Agent Manage 管理，不作为 DSH 插件直接安装。',
    en: 'Company plugin catalog.\n\n[GEA](https://github.com/CleverC2200/dsh-gea-plugin) · [Agent Manage](https://github.com/CleverC2200/dsh-agent-manage) · [Agent suites](https://github.com/CleverC2200/company-agent-suites)\n\nManage resource suites with Agent Manage; do not install the suite repository as a runtime plugin.'
  } }
}
