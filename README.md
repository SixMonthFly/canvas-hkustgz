# Canvas 课程管理官网

面向港科广同学的中文 Mac / Windows 软件下载站。GitHub Pages 托管网页，GitHub Releases 存储独立版本的完整安装包。

- 官网：<https://sixmonthfly.github.io/canvas-hkustgz/>
- 发布仓库：[SixMonthFly/canvas-hkustgz](https://github.com/SixMonthFly/canvas-hkustgz)
- 安装包：[GitHub Releases](https://github.com/SixMonthFly/canvas-hkustgz/releases)

`site/` 是可直接发布的静态页面，包含虚构课程数据的真实界面演示。页面不会连接学校账号、Canvas 或 AI 服务。

## 发布

1. 将本目录中的发布文件更新到 `SixMonthFly/canvas-hkustgz` 的 `main` 分支。
2. 在仓库 Settings → Pages 中，将 Source 设为 GitHub Actions；随后在 Settings → Environments → `github-pages` → Deployment branches and tags 中选择 Selected branches and tags，保留或添加类型为 Branch 的 `main` 规则，再添加类型为 Tag 的 `v*` 规则。两种类型须分别配置。如果 fork 后 Actions 尚未启用，先在 Actions 页面启用。
3. 根据 `site/release.json` 的 `packages.mac`、`packages.windows` 分别准备版本对应的 draft Release，上传完整 Apple Silicon DMG 或 Windows x64 EXE。两平台版本独立；版本相同时可放在同一个 Release。确认附件上传完整后再公开 Release。
4. 工作流逐个平台核对 GitHub 正式 Release 的附件名称、大小、SHA-256 digest 和该仓库下的规范下载 URL。只有核对通过的平台才启用下载，然后发布 `main` 分支上的最新网站。

Release 发布事件按版本标签检查环境规则，例如 `v0.3.6`；工作流中的 `checkout ref: main` 只控制读取的源码，并不改变该事件的标签身份。缺少 Tag `v*` 规则时，自动部署会提示标签不允许部署到 `github-pages`。规则保存后可重新运行失败任务，也可从 Actions 手动选择 `main` 运行 `Publish website`。

下载元数据采用 `schemaVersion: 2`，`packages.mac` 和 `packages.windows` 各自保存版本、标签、文件名、大小、SHA-256、URL 与 `available` 状态。某个平台缺少附件、大小不符或缺少摘要时，仅禁用该平台下载，不影响另一平台。SHA-256 或下载 URL 与审核信息冲突时中止新部署，保留上一次可信网站。不要把 DMG 或 EXE 提交到 Git 源码仓库。

本次已将 `packages.windows` 更新为 v0.3.7，并继续保留 `packages.mac` 的 v0.3.6：Windows 下载指向 v0.3.7 Release，Mac 下载仍指向 v0.3.6 Release。两个平台分别校验，不因 Windows 升版改变 Mac 包或版本号。

如果已公开 Release 后才补传附件，在 Actions → Publish website → Run workflow 中选择 `main`，手动运行一次。补传附件不会自动触发网站发布；也可以在上传后推送网站更新，由 main 分支更新触发部署。

当前 Mac 安装包使用本地签名，尚未完成 Apple Developer ID 签名与公证。网页提供首次打开说明。

## Windows v0.3.7 安装包（已发布）

本次 Windows 完整 x64 NSIS 安装器由当前项目源码构建。实际 NSIS 安装载荷已完成独立复核：主进程、预加载、同步桥及 renderer 的 HTML、JavaScript、CSS、字体、许可和 vendor 共 9 项文件，与当前源码及本机已安装 Mac 应用逐字节一致。安装器、内嵌应用与 ASAR 中的 `package.version` 均为 0.3.7，内嵌应用为 AMD64；安装器和内嵌应用的 PE 证书表均为空。此前新界面 Windows 构建仅保存在本地，官网仍提供旧 Gitee v0.3.6 包，因此用户从官网下载后看到的是旧界面。本次使用独立 v0.3.7 版本发布，不覆盖旧 v0.3.6 附件。

- 文件：`CanvasManager-Setup-0.3.7-x64.exe`
- 本地构建产物：`output/windows-v0.3.7/CanvasManager-Setup-0.3.7-x64.exe`
- 大小：122,153,645 字节
- SHA-256：`f309735c603db258e9d3afebd14a3c1245b99b3334cdeee0a760d7b33cd6be76`
- 正式发布：[GitHub v0.3.7 Release](https://github.com/SixMonthFly/canvas-hkustgz/releases/tag/v0.3.7)

源码 `app/package.json` 保持 0.3.6；Windows 构建使用 `extraMetadata.version=0.3.7` 覆盖包内版本。Mac 安装包与官网 Mac 版本继续为 v0.3.6，不随此次 Windows 构建更新。

适用于 Windows 10 / 11 x64。双击 EXE 后按当前用户自动安装，创建快捷方式并启动应用；首次使用点击「同步」完成学校账号登录。NSIS 配置为 `oneClick: true`、`perMachine: false`、`runAfterFinish: true`。官网直接提供完整 EXE，不使用仍需下载分卷的在线引导程序。

当前状态：Windows v0.3.7 已正式上传至 GitHub Releases，官网已切换下载元数据。公开附件的大小及 SHA-256 digest 与本地一致；匿名完整下载返回 HTTP 200，122,153,645 字节，完整文件 SHA-256 与本地安装包相同，文件头为 MZ。本机未执行 Windows 安装和应用运行测试，学校登录与同步也未验证。应用内更新渠道仍为 Gitee，未改为 GitHub。

## 历史 Windows v0.3.6 审计记录

此前官网镜像的是[原项目 v0.3.6 正式 Release](https://gitee.com/xxouyang123/hkustgz_diy_canvas/releases/tag/v0.3.6) 的 Windows 包，将 `part00`、`part01` 按顺序二进制合并，没有重新打包。旧附件继续保留在 [GitHub v0.3.6 Release](https://github.com/SixMonthFly/canvas-hkustgz/releases/tag/v0.3.6)，不作为本次新界面发布包。

- 历史文件：`CanvasManager-Setup-0.3.6-x64.exe`
- 历史大小：122,045,135 字节（116.39 MiB）
- 历史 SHA-256：`081d848d294d62a9ab111f0a5ed7450535fe67363c21188a3194a1eaa214a0cd`
- 原始校验信息：[v0.3.6-sha256.txt](https://gitee.com/xxouyang123/hkustgz_diy_canvas/releases/download/v0.3.6/v0.3.6-sha256.txt)

旧包曾完成 GitHub 附件大小、digest 和匿名 Range 校验；这些历史结果不代表新 v0.3.7 包已经上传或通过 Windows 实机测试。

## 图片与源码

校园照片：Tim Wu，CC BY-SA 4.0，完整署名与出处见 `site/assets/SOURCES.md`。网页使用缩放、裁切与蓝色遮罩，图片仍按相同许可提供。

应用界面源自 [HKUST-GZ Canvas 课程管理](https://gitee.com/xxouyang123/hkustgz_diy_canvas)（MIT）。本站是独立学生工具介绍页，不代表学校或 Canvas 官方。
