# Canvas 课程管理

让每一课，都有条理。面向使用 Canvas 的大学用户，把课程、作业、公告和课件集中到桌面管理。

[访问官网](https://sixmonthfly.github.io/canvas-hkustgz/) · [下载安装包](https://github.com/SixMonthFly/canvas-hkustgz/releases) · [应用源码](https://gitee.com/xxouyang123/hkustgz_diy_canvas) · [问题反馈](https://gitee.com/xxouyang123/hkustgz_diy_canvas/issues)

## 多大学支持

项目已从单校工具扩展为多校架构。目前已收录以下 Canvas 入口：

| 学校 | Canvas 入口 |
| --- | --- |
| 香港科技大学（广州） | https://hkust-gz.instructure.com |
| 香港科技大学 | https://canvas.ust.hk |
| 香港城市大学 | https://canvas.cityu.edu.hk |
| 新加坡国立大学 | https://canvas.nus.edu.sg |
| 新加坡社科大学 | https://canvas.suss.edu.sg |

在多校版本的「设置 → 常规 → 学校」选择学校并保存，应用自动重启，再点击同步，使用学校账号完成认证。各校的课程、登录会话、下载、AI 配置与报告分别保存。有同步、下载或插件任务进行时，需等待任务完成后切换。

**发布状态（2026-10-07）：**多校适配已在本地实现，公开 Mac / Windows 安装包仍为 2026-10-02 发布的 v4.0.0，尚未包含多校切换。本次更新官网与说明，不替换安装包。入口核实和本地测试不等于各校真实账号验收；登录、MFA、同步和附件下载仍需逐校验证。未列出的学校及其他 LMS 暂不承诺支持。

## 在桌面上管理课程

- **作业与日历**：聚合截止日期，按课程查看作业要求、附件和完成状态。
- **公告与课件**：集中查看课程消息，批量下载讲义与阅读材料。
- **按需启用的 AI**：在「设置 → 插件」启用 AI 助手，获得课程导学、公告摘要与作业思路。首次默认关闭。
- **默认外观与皮肤**：多校版本以白色基础界面启动，所有皮肤均按需安装；已安装的皮肤保留。
- **插件管理**：可安装、卸载和重新安装随包插件，卸载保留课程、配置与报告。尚不支持在线插件市场。
- **Mac 小组件**：通过插件把未来七天的作业放到桌面，需要 macOS 14+。
- **独立 MCP 服务**：让支持 MCP 的 AI 查询本机已同步课程。服务需单独配置、构建与更新，参见[连接说明](https://gitee.com/xxouyang123/hkustgz_diy_canvas/blob/master/mcp-server/README.md)。

课程缓存与设置保存在本机。同步时连接学校 Canvas；主动使用 AI 时，相关课程内容会发送至所选 AI 服务。信息以学校 Canvas 和最近一次同步为准。

## 下载与兼容性

| 平台 | 公开版本 | 安装包 | 要求 |
| --- | --- | --- | --- |
| Mac | 4.0.0 | 完整 DMG | macOS 13+、Apple Silicon；Intel 版暂未提供 |
| Windows | 4.0.0 | 完整 EXE | Windows 10 / 11 x64 |

Mac 包使用本地签名，尚未 Apple 公证；Windows 包尚未签名，Windows 实机运行仍需验证。安装方法、校验信息与各平台的实际可用状态请查看[官网](https://sixmonthfly.github.io/canvas-hkustgz/#download)和 [Release](https://github.com/SixMonthFly/canvas-hkustgz/releases/tag/v4.0.0)。

小包更新机制尚未开放；官网更新不表示客户端已更新。Mac 和 Windows 的安装包版本独立维护。

## 关于这个仓库

本仓库保存官网、虚构数据的交互演示和公开安装包的发布记录，应用源码在 [Gitee](https://gitee.com/xxouyang123/hkustgz_diy_canvas)。保留原仓库地址，已有下载与官网链接继续有效。

官网使用与客户端基础界面一致的白色、浅灰和蓝色配色，不使用学校徽标或校园照片。首屏与产品展示的排版参考 [DeepSeek Harness](https://www.deepseek.com/en/harness/)，未使用其品牌素材。网页演示不连接学校账号、Canvas 或 AI 服务。

这是独立工具，不代表任何大学或 Instructure Canvas 官方。

## 网站维护

- site/：原生 HTML / CSS / JavaScript 网站与演示。
- site/release.json：Mac / Windows 分别维护的下载元数据。
- scripts/prepare-release.py：核对 Release 附件名称、大小、SHA-256 digest 和规范下载 URL。
- .github/workflows/pages.yml：向 main 推送、公开 Release 或手动运行时部署 GitHub Pages。

发布文件由应用源码仓库的 website/scripts/build-pages.mjs 白名单导出。导出不会复制应用源码、账号、课程缓存或安装包。新增资源需更新白名单。只有正式 Release 附件核对成功的平台才启用下载；SHA-256 或 URL 冲突会中止新部署。补传附件后需手动重新运行网站工作流。

Pages 使用 GitHub Actions，部署环境需允许 main 分支及 v* 标签。历史版本的审计记录保留在仓库 Git 历史中。
