# GEA 公司插件市场（本地派生版）

基于 dshplugin/dsh-plugin-hub 的本地分支，保留上游 MIT 许可证。Git remote `upstream` 指向原仓库，`origin` 指向 https://github.com/CleverC2200/dsh-plugin-hub；本地改动尚未推送。

插件目录由 `src/server/company-catalog.json` 维护，替代上游在线目录与统计接口，不读取旧目录缓存。目录、关于内容和自身更新不再访问 api.dsh-plugin.org。公司版自身更新暂时关闭，避免覆盖回上游发行版；npm 依赖源仍使用用户原有配置。

目前收录 CleverC2200/dsh-gea-plugin 与 CleverC2200/dsh-agent-manage。GEA 尚未完成标准 bundle 分发，目录中禁用一键安装；Agent Manage 保留原安装流程，尚未在公司桌面包内验证安装。company-agent-suites 属于 Agent 套件仓库，在关于页提供入口，不作为 DSH npm 插件安装。公共工作台已迁至 CleverC2200/dsh-agent-workbench 私有仓库，以独立插件列入目录；安装需要该仓库读取权限。

修改目录后执行 npm run check 构建并验证。原有自定义安装入口继续保留；此改动收敛默认目录，不禁止用户手动安装目录外插件。尚未替换已安装桌面应用，也未实现外置插件运行目录、桌面重启适配或回退。

上游文档见 README.en.md；其中上游目录、自更新、网站说明不代表本地派生版行为。

公司桌面更新、正式/测试发行渠道与私有访问约定见 [发行说明](docs/company/releases.md)。桌面更新由 Electron 在外置目录准备，业务用户不填写服务器地址或模型 ID。
