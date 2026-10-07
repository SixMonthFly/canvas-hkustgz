# Canvas Manager · Canvas 课程管理

让每一课，都有条理。把 Canvas 的课程、作业、公告和课件集中到桌面。

[中文官网](https://sixmonthfly.github.io/canvas-hkustgz/) · [English website](https://sixmonthfly.github.io/canvas-hkustgz/en/) · [下载 4.1.0](https://github.com/SixMonthFly/canvas-hkustgz/releases/tag/v4.1.0) · [应用源码](https://gitee.com/xxouyang123/hkustgz_diy_canvas)

## 4.1.0 · 多校、双语与使用指引

- 在「设置 → 常规」切换中文 / English。首次启动有语言、学校与同步指引；已有用户可从设置重新打开。
- 内置香港科技大学（广州）、香港科技大学、香港城市大学、新加坡国立大学与新加坡社科大学的 Canvas 入口。NUS 用户已反馈登录与功能正常；各校账号权限、MFA 与网络条件可能不同。
- 各校课程、登录会话、下载和 AI 配置分别保存。更换学校后保存会自动重启；任务进行时暂不能切换。
- 基础界面采用白色、浅灰和蓝色，使用独立的 C + check 图标。皮肤按需安装，已有皮肤保留。
- AI 在「设置 → 插件」按需启用，首次默认关闭。随包插件支持安装、卸载和重新安装，卸载保留课程、配置与报告；尚无在线插件市场。
- 保留 Mac 原生系统小组件（macOS 14+），移除旧的独立七天作业桌面卡片。
- [独立 MCP 服务](https://gitee.com/xxouyang123/hkustgz_diy_canvas/blob/master/mcp-server/README.md)让兼容的 AI 查询本机已同步课程，需要单独配置与更新。

## 下载与更新

| 平台 | 版本 | 安装包 | 系统要求 |
| --- | --- | --- | --- |
| Mac | 4.1.0 | 完整 DMG | macOS 13+、Apple Silicon |
| Windows | 4.1.0 | 完整 EXE | Windows 10 / 11 x64 |

Mac 包使用本地签名，尚未 Apple 公证；Windows 包尚未签名，Windows 实机运行仍需验证。安装方法、SHA-256 与实际可用状态见官网和 Release。

4.1.0 的「检查更新」读取官网发布信息并打开对应平台的完整安装包。退出应用后安装，保留课程、设置与登录会话。小型代码包更新尚未实现；官网发布与客户端更新是独立流程。

课程缓存与设置保存在本机。同步连接学校 Canvas；主动使用 AI 时，相关内容发送至所选 AI 服务。课程信息以学校 Canvas 和最近一次同步为准。

## English

Canvas Manager brings Canvas courses, assignments, announcements and files to your desktop. **4.1.0** adds Chinese / English switching, a welcome guide, multi-school selection and an independent app icon.

- Included Canvas endpoints: HKUST (Guangzhou), HKUST, CityUHK, NUS and SUSS. A NUS user has reported successful sign-in and normal operation. Authentication and permissions may vary by campus.
- Each school keeps separate course data and sign-in sessions. Choose your school in Settings and save to restart.
- Switch language in Settings → General. New users get a welcome guide; existing users can replay it in Settings.
- AI is optional and off by default. Themes are installed on demand; existing installations are preserved. Bundled plugins support installation, removal and reinstallation. There is no online plugin marketplace.
- Native Mac widgets require macOS 14+. The separate MCP service is maintained independently.
- Mac: macOS 13+, Apple Silicon; locally signed, not notarized. Windows: Windows 10/11 x64; unsigned, runtime testing on Windows is still pending.
- Updates currently use full installers. Quit before replacing the app; courses, preferences and sign-in sessions are retained. No code-package updater is available yet.

## 关于仓库 / About this repository

本仓库保存官网、虚构数据演示与公开安装包发布记录，不包含应用源码或用户数据。应用源码在 Gitee。保留原地址以确保已有链接继续有效。

This repository contains the public website, fictional-data demo and release assets. App source is hosted on Gitee. This independent tool is not affiliated with any university or Instructure Canvas.

官网排版与动效参考 [DeepSeek Harness](https://www.deepseek.com/en/harness/)，未使用其品牌素材。网页演示不连接学校账号、Canvas 或 AI 服务。

## 网站维护

`site/` 保存静态页面与演示。`site/release.json` 分平台记录下载元数据。`scripts/prepare-release.py` 核对正式 Release 附件的名称、大小、SHA-256 与 URL 后启用下载；不匹配会中止部署。GitHub Actions 在 main 推送、公开 Release 或手动运行时部署 Pages。

发布内容由源码仓库的 `website/scripts/build-pages.mjs` 白名单导出，不复制应用源码、账号、课程缓存或安装包。历史审计记录保留在 Git 历史中。
