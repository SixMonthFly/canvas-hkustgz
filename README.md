# Canvas Manager · Canvas 课程管理

让每一课，都有条理。完全免费、开源的 Canvas 桌面工具，通过学校开放的 Canvas API 同步课程、作业、公告和课件；课程缓存、设置与下载文件保存在本机。

[中文官网](https://sixmonthfly.github.io/canvas-hkustgz/) · [English website](https://sixmonthfly.github.io/canvas-hkustgz/en/) · [下载 4.1.2](https://github.com/SixMonthFly/canvas-hkustgz/releases/tag/v4.1.2) · [应用源码](https://gitee.com/xxouyang123/hkustgz_diy_canvas)

## 4.1.2 · 多校、双语与使用指引

- 在「设置 → 常规」切换中文 / English。首次启动自动显示指引；未完成且未主动跳过时，每次启动继续。关闭只表示稍后再看，学校切换重启后继续指引；实际操作步骤不遮挡界面，可直接登录同步。设置中可重新查看。
- 内置 11 所大学的 Canvas 入口，覆盖六大洲：香港科技大学（广州）、香港科技大学、香港城市大学、新加坡国立大学、新加坡社科大学、哈佛大学、牛津大学、墨尔本大学、奥克兰大学、金山大学和智利天主教大学。新增入口依据学校官方资料核实，真实账号登录与 API 权限仍需逐校验证。NUS 用户已反馈登录与功能正常；各校账号权限、MFA 与网络条件可能不同。
- 各校课程、登录会话、下载和 AI 配置分别保存。更换学校后保存会自动重启；任务进行时暂不能切换。
- 基础界面采用白色、浅灰和蓝色，使用独立的 C + check 图标。皮肤按需安装，已有皮肤保留。
- AI 在「设置 → 插件」按需启用，首次默认关闭。随包插件支持安装、卸载和重新安装，卸载保留课程、配置与报告；尚无在线插件市场。
- 保留 Mac 原生系统小组件（macOS 14+），移除旧的独立七天作业桌面卡片。
- [独立 MCP 服务](https://gitee.com/xxouyang123/hkustgz_diy_canvas/blob/master/mcp-server/README.md)让兼容的 AI 查询本机已同步课程，需要单独配置与更新。

## 下载与更新

| 平台 | 版本 | 安装包 | 系统要求 |
| --- | --- | --- | --- |
| Mac | 4.1.2 | 完整 DMG | macOS 13+、Apple Silicon |
| Windows | 4.1.2 | 完整 EXE | Windows 10 / 11 x64 |

Mac 包使用本地签名，尚未 Apple 公证；Windows 包尚未签名，Windows 实机运行仍需验证。安装方法、SHA-256 与实际可用状态见官网和 Release。

4.1.2 的「检查更新」读取官网发布信息并打开对应平台的完整安装包。退出应用后安装，保留课程、设置与登录会话。小型代码包更新尚未实现；官网发布与客户端更新是独立流程。

课程缓存与设置保存在本机。同步连接学校 Canvas；主动使用 AI 时，相关内容发送至所选 AI 服务，第三方 AI 服务可能单独收费。课程信息以学校 Canvas 和最近一次同步为准。

## English

Canvas Manager is a completely free, open-source project that uses school Canvas APIs and stores course caches, settings and downloads locally. It brings Canvas courses, assignments, announcements and files to your desktop. **4.1.2** adds Chinese / English switching, a welcome guide, multi-school selection and an independent app icon.

- 11 Canvas presets across six continents: HKUST (Guangzhou), HKUST, CityUHK, NUS, SUSS, Harvard, Oxford, Melbourne, Auckland, Witwatersrand and Pontificia Universidad Católica de Chile. The new endpoints are verified against official university sources; account access and API permissions still need per-school testing. A NUS user has reported successful sign-in and normal operation. Authentication and permissions may vary by campus.
- Each school keeps separate course data and sign-in sessions. Choose your school in Settings and save to restart.
- Switch language in Settings → General. The guide opens at launch until completed or explicitly skipped. Closing means finish later. The guide resumes after a school restart. Its practical step leaves the app interactive and offers a direct sign-in and sync button. Replay it in Settings.
- AI is optional and off by default. Themes are installed on demand; existing installations are preserved. Bundled plugins support installation, removal and reinstallation. There is no online plugin marketplace.
- Native Mac widgets require macOS 14+. The separate MCP service is maintained independently.
- Mac: macOS 13+, Apple Silicon; locally signed, not notarized. Windows: Windows 10/11 x64; unsigned, runtime testing on Windows is still pending.
- Updates currently use full installers. Quit before replacing the app; courses, preferences and sign-in sessions are retained. No code-package updater is available yet. Third-party AI providers may charge separately.

## 关于仓库 / About this repository

本仓库保存官网、虚构数据演示与公开安装包发布记录，不包含应用源码或用户数据。应用源码在 Gitee。保留原地址以确保已有链接继续有效。

This repository contains the public website, fictional-data demo and release assets. App source is hosted on Gitee. This independent tool is not affiliated with any university or Instructure Canvas.

官网功能现以独立卡片直接铺开，支持同步进度、月历高亮、下载进度、分析路径、MCP 对话和插件/API 内容自动滚动；动效可暂停并遵循系统减弱动态设置。中英文页面同步维护。

Features are presented in a normal-flow gallery with animated sync, calendar, file download, analysis and MCP previews. Animations can be paused and respect reduced-motion preferences.

官网排版与动效参考 [DeepSeek Harness](https://www.deepseek.com/en/harness/)，未使用其品牌素材。网页演示不连接学校账号、Canvas 或 AI 服务。

## 网站维护

`site/` 保存静态页面与演示。`site/release.json` 分平台记录下载元数据。`scripts/prepare-release.py` 核对正式 Release 附件的名称、大小、SHA-256 与 URL 后启用下载；不匹配会中止部署。GitHub Actions 在 main 推送、公开 Release 或手动运行时部署 Pages。

发布内容由源码仓库的 `website/scripts/build-pages.mjs` 白名单导出，不复制应用源码、账号、课程缓存或安装包。历史审计记录保留在 Git 历史中。

## 新增学校依据 / Sources for new presets

- [Harvard University](https://atg.fas.harvard.edu/canvas-behind-scenes) · `https://canvas.harvard.edu`
- [University of Oxford](https://login.canvas.ox.ac.uk/) · `https://canvas.ox.ac.uk`
- [University of Melbourne](https://study.unimelb.edu.au/study-with-us/online-courses/current-students/online-systems-support/lms) · `https://canvas.lms.unimelb.edu.au`
- [University of Auckland](https://teachwell.auckland.ac.nz/canvas/canvas-baseline-practices-2/2-orientation-to-course/) · `https://canvas.auckland.ac.nz`
- [University of the Witwatersrand](https://www.wits.ac.za/ulwazi/) · `https://ulwazi.wits.ac.za`
- [Pontificia Universidad Católica de Chile](https://cddoc.uc.cl/servicios/canvas/) · `https://cursos.canvas.uc.cl`
