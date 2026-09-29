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

如果已公开 Release 后才补传附件，在 Actions → Publish website → Run workflow 中选择 `main`，手动运行一次。补传附件不会自动触发网站发布；也可以在上传后推送网站更新，由 main 分支更新触发部署。

当前 Mac 安装包使用本地签名，尚未完成 Apple Developer ID 签名与公证。网页提供首次打开说明。

## Windows 稳定安装包

Windows 包来自[原项目 v0.3.6 正式 Release](https://gitee.com/xxouyang123/hkustgz_diy_canvas/releases/tag/v0.3.6)，将原有 `part00`、`part01` 按顺序二进制合并成完整 EXE，没有重新打包。官网直接提供完整安装器，不使用仍需从 Gitee 下载分卷的在线引导程序。

- 文件：`CanvasManager-Setup-0.3.6-x64.exe`
- 大小：122,045,135 字节（116.39 MiB）
- SHA-256：`081d848d294d62a9ab111f0a5ed7450535fe67363c21188a3194a1eaa214a0cd`
- 原始校验信息：[v0.3.6-sha256.txt](https://gitee.com/xxouyang123/hkustgz_diy_canvas/releases/download/v0.3.6/v0.3.6-sha256.txt)

适用于 Windows 10 / 11 x64。双击 EXE 后按当前用户自动安装，创建快捷方式并启动应用；首次使用点击「同步」完成学校账号登录。原 NSIS 配置为 `oneClick: true`、`perMachine: false`、`runAfterFinish: true`。

当前状态：完整 Windows EXE 已公开发布至 GitHub v0.3.6 Release，文件大小与 SHA-256 与原发布完全一致。本机未执行 Windows 安装和应用运行测试。此次修改只扩展官网与发布附件，应用内更新渠道仍为 Gitee。

## 图片与源码

校园照片：Tim Wu，CC BY-SA 4.0，完整署名与出处见 `site/assets/SOURCES.md`。网页使用缩放、裁切与蓝色遮罩，图片仍按相同许可提供。

应用界面源自 [HKUST-GZ Canvas 课程管理](https://gitee.com/xxouyang123/hkustgz_diy_canvas)（MIT）。本站是独立学生工具介绍页，不代表学校或 Canvas 官方。
