# Canvas 课程管理官网

中文 Mac 软件下载站。GitHub Pages 托管网页，GitHub Releases 存储独立版本的安装包。

`site/` 是可直接发布的静态页面，包含虚构课程数据的真实界面演示。页面不会连接学校账号、Canvas 或 AI 服务。

## 发布

1. 将本目录上传到自己的 GitHub 仓库的 `main` 分支。
2. 在仓库 Settings → Pages 中，将 Source 设为 GitHub Actions。
3. 创建与 `site/release.json` 中版本一致的 draft Release，先上传对应 Apple Silicon DMG，确认上传完整后再公开 Release。
4. 工作流核对安装包名称、大小与可用的 SHA-256 信息，然后发布 `main` 分支上的最新网站。

未找到安装包时，下载按钮会明确提示尚未发布。不要把 DMG 提交到 Git 源码仓库。

如果已公开 Release 后才补传附件，在 Actions 中手动运行一次 Publish website。补传附件不会自动触发网站发布。

当前 Mac 安装包使用本地签名，尚未完成 Apple Developer ID 签名与公证。网页提供首次打开说明。

## 图片与源码

校园照片：Tim Wu，CC BY-SA 4.0，完整署名与出处见 `site/assets/SOURCES.md`。网页使用缩放、裁切与蓝色遮罩，图片仍按相同许可提供。

应用界面源自 [HKUST-GZ Canvas 课程管理](https://gitee.com/xxouyang123/hkustgz_diy_canvas)（MIT）。本站是独立学生工具介绍页，不代表学校或 Canvas 官方。
