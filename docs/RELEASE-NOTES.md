# 客户端近期工作与验证记录 / Client work and evidence

资料整理：2026-10-09。当前公开客户端为 **4.1.2**（GitHub Release 发布时间 2026-10-07）。本次只同步文档，不发布新客户端，不重传已有安装包。

## 4.0.0：插件与基础界面

- AI 独立为可选随包插件，首次默认关闭；开启后保留作业解读 / 方案、公告摘要、课程分析等能力。
- 设置统一保存外观、诊断与已启用插件配置。测试连接、能力探测和取消不自动保存 AI 草稿；插件安装、卸载和启停即时持久化。
- 随包插件具备安装、卸载和从随包副本重新安装的流程，卸载保留课程、配置与报告。没有网络插件商店。
- 多校后续要求优先：皮肤首次全部按需安装，已有安装状态保留，不再默认安装 HKUST 皮肤。

## 4.1.0：多校、双语、独立图标

- 内置学校选择；学校课程、会话、下载、AI 配置 / 报告分别保存。切校保存后重启，活动任务期间阻止切换。
- 中英文界面与首次使用指引；C + check 独立品牌图标，默认基础外观不使用大学主题。
- 保留已安装随包插件的启用状态，用户明确卸载的插件不自动恢复。
- 保留 Mac 原生系统小组件，移除旧独立七天作业桌面卡片。
- 检查更新读取官网 `release.json` 并打开规范的完整安装包 URL；MCP 保持独立程序。

## 4.1.1：使用指引行为修正

- 首次启动自动显示，不从已有课程推断完成。
- 明确记录 `pending` / `completed` / `skipped`；关闭 / Esc 表示稍后继续，只有完成或主动跳过才停止自动显示。
- 学校选择先保存为草稿，进入应用时才应用；切校重启前保存进度，重启后继续实际操作步骤。
- 实际操作为非模态小卡片，主界面可点击，并提供「登录并同步」，避免让用户点击被模态窗口挡住的同步按钮。
- 原有 3 步模态“完成并重启”截图属于修正前状态；当前是 4 阶段流程，不应继续用旧图制作新版本教程。

## 4.1.2：全球学校预设

新增 Harvard、Oxford、Melbourne、Auckland、Wits、UC Chile，连同原有 HKUST(GZ)、HKUST、CityUHK、NUS、SUSS，共 11 个 Canvas 预设，覆盖六大洲。学校来源和登录 / API 验证边界见 [schools.json](schools.json) 与[使用说明](PRODUCT-GUIDE.zh-CN.md)。

NUS 的首次导航 `ERR_ABORTED` 特例处理属于既有多校修复：继续同一次认证流程；其他网络错误仍报错。登录成功以 Canvas 用户 API 返回有效用户为依据，不用“跳到学校同域页面”冒充已登录。

### 已有 4.1.2 发布验证记录

以下是 2026-10-07 发布时的验证结果，本次整理没有重新运行这些测试：

| 层级 | 记录 | 不能由此推出的结论 |
| --- | --- | --- |
| Node 自动化 | 80 项通过 | 不等于所有学校真实账号 / API 验收 |
| 打包后指引 | 9 个连续启动 / 重启阶段通过，使用隔离合成环境 | 不等于真实 SSO / MFA 成功 |
| 两端打包内容 | 两平台 46 个源文件对比通过 | 不等于 Windows 实机运行通过 |
| Mac 安装包 | 签名、DMG 校验、本机完整安装检查通过 | 本地签名不等于 Apple 公证 |
| Windows 安装包 | 安装器载荷核对通过 | 未签名，未 Windows 实机运行验收 |
| 公开发布 | v4.1.2 Release 与匿名下载大小 / SHA-256 验证通过 | 不证明每个学校账号功能可用 |

2026-10-09 本次通过 GitHub API 再核对：最新公开 Release 为 v4.1.2，Mac / Windows 安装包与 `SHA256SUMS.txt` 存在，远端大小和 digest 与发布记录一致。安装包元数据见 [product-facts.json](product-facts.json)。

## 官网最近工作是独立的

- 双语页面、固定下载 Dock、免费开源与本地数据说明。
- 功能普通页面流展开，取消固定窗口随滚动切换内容。
- 10 张真实打包客户端 PNG，虚构课程数据；AI / MCP / API / 小组件插画另行标注。
- 自动滚动内容卡片、可暂停动画、减少动态效果支持。
- 更直白的功能文案，如“批量下载课件”。
- 2026-10-08 修正中英文首屏标题容器居中；官网提交 `e41de4108684834aaa84b048c0e94ff4b16d848d`，Pages 运行 `37654515399` 成功。

这些网页改动没有生成 4.1.3 客户端。浏览器交互演示仍是历史 0.3.6 界面，不要作为最新版客户端宣传。

## 仍未完成 / 不可宣称已上线

- 签名代码小包启动器、兼容性检查、自动失败回退和免重装热更新。
- 在线插件市场、远程插件下载和任意第三方插件安装。
- 全部 11 校真实学生账号、MFA、API、公告、附件下载的逐校验收。
- Windows 实机验收、Windows 安装器签名与 Mac Apple 公证。
- 新增其他 LMS 适配、任意学校 URL、同校多账号和跨校合并日历。
- 当前公开 Intel Mac / Linux / 移动端版本。

## Evidence summary in English

Public desktop release: 4.1.2. Work includes multi-school selection and isolation, Chinese/English UI, resumable first-run onboarding with a non-modal practical step, an independent icon, optional bundled plugins, native Mac widgets and six additional university presets. The 2026-10-07 release recorded 80 Node tests, nine packaged onboarding restart phases, matching source files in both platform packages, Mac signature/DMG verification, Windows payload checks and anonymous download verification. These are historical release records, not newly executed tests or proof of all school accounts. On 2026-10-09 the latest Release assets and their API digests were rechecked. Mac is not notarized; Windows is unsigned and not runtime-tested. Website changes are separate. Small code-package updates and remote plugin distribution remain unimplemented.
