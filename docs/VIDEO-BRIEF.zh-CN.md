# Canvas Manager 宣传视频取材资料

更新：2026-10-09；对应公开桌面版 **4.1.2**。详细能力以[产品说明](PRODUCT-GUIDE.zh-CN.md)、[学校列表](schools.json)、[版本记录](RELEASE-NOTES.md)为准。这里的分镜是建议脚本，不表示录像已经制作，也不代表未测试功能已经通过实测。

## 先读哪些文件

1. `PRODUCT-GUIDE.zh-CN.md`：产品定位、学校兼容条件、完整使用流程和能力边界。
2. `product-facts.json`：版本、下载地址、核心功能、默认状态、验证情况和不能使用的宣传表述。
3. `schools.json`：11 校名称、地区、大洲、入口与收录依据。
4. `screenshots.json`：10 张真实 Mac 客户端截图的相对路径、公开 URL、尺寸、SHA-256 与可说明的功能。
5. `RELEASE-NOTES.md`：4.0 到 4.1.2 的变化，以及客户端和官网的区别。

这些资料可直接从 GitHub `main` 分支取得。截图已经在 `site/assets/product/`，不必用手绘界面代替。资料日期是本次整理日期，不是新客户端发布日期。制作前检查 Releases 是否出现更新版本。

## 视频应优先表达什么

主线是普通用户最直接的需求：**批量下载课件 → 集中查看作业 → 用日历查看截止日期 → 阅读公告**。多校和中英文是适用范围；AI、Mac 小组件、MCP 是后面的可选能力，不要让观众误以为不开 AI 就不能用。

建议开场文案：

> 学校用 Canvas？用 Canvas Manager 批量下载课件、集中查看作业和公告，再用一个日历查看截止日期。

建议一句话产品介绍：

> 免费、开源的 Canvas 桌面工具，课程缓存和下载文件保存在本机。

学校字幕：

> 内置 11 所大学的 Canvas 入口，覆盖六大洲。实际登录、同步和下载取决于学校账号、MFA 与 API 权限。

英文对应：

> Download course files in bulk. View assignments and announcements. Track course deadlines in one calendar.

> A free, open-source Canvas desktop tool. Course caches and downloads stay on your computer.

> 11 school presets across six continents. Sign-in and functionality depend on school authentication and API permissions.

文案用具体动词与功能名称，不使用“你的课程，即将就位”“让每一课，都有条理”这类口号。品牌名称使用 Canvas Manager / Canvas 课程管理；图标使用项目自己的 C + check，不使用大学徽标代替产品标志。

## 60–90 秒建议分镜

| 时间 | 画面 / 操作 | 旁白 / 字幕 | 素材与证据 |
| --- | --- | --- | --- |
| 0–8 秒 | 展示真实课件列表，聚焦下载操作 | “批量下载课件，不用逐个打开文件。” | `files-zh.png` / `files-en.png`；如果需要真实按钮点击和进度，必须另录客户端操作，静态截图不能伪装下载成功 |
| 8–20 秒 | 全部课程页面，突出下一项截止与日历 | “集中查看作业，用一个日历查看未来 30 天的截止日期。” | `home-zh.png` / `home-en.png`；数据来自最近同步 |
| 20–32 秒 | 课程总览切到展开的作业说明 | “选中课程，查看作业要求、截止日期和已同步的提交状态。” | `overview-*.png`、`assignments-*.png` |
| 32–40 秒 | 展开公告 | “课程公告集中查看，也能打开原 Canvas 页面。” | `announcements-*.png` |
| 40–55 秒 | 真实录制首次指引与学校下拉框；无录像时用带标签的信息卡 | “首次启动选择语言和学校，再用学校账号登录同步。” | 当前没有首次指引截图素材；信息卡标注“流程说明”，不绘制假学校登录成功画面 |
| 55–63 秒 | 中英文对应界面切换，学校名称列表 | “支持中英文界面，内置 11 个 Canvas 学校入口。” | 两套真实 PNG；剪辑切换不是语言切换操作录像；注明账号兼容条件 |
| 63–76 秒 | 插件说明卡，或新录制真实设置操作 | “AI 默认关闭；需要时可启用。Mac 用户还可添加原生小组件。” | AI、小组件现有 SVG 属于示意图；AI 服务可能收费，小组件要求 macOS 14+ |
| 76–90 秒 | 图标、产品名、官网 / GitHub 地址 | “免费开源，课程缓存和课件保存在本机。到官网选择 Mac 或 Windows 版本。” | `site/assets/favicon.svg`；下载页 / 正式 Release |

可将前四个镜头剪成 30 秒基础功能版本；MCP 留给扩展介绍，不需要塞进主宣传片。需要展示 MCP 时，用“另行配置后，AI 可查询本机已同步课程”描述，并标注示例对话。

## 真实界面素材

全部截图为 2400×1520 PNG，来自实际打包 Mac 4.1.2 客户端，默认外观，选中 HKUST(GZ) 预设，使用隔离的虚构课程。可用于 UI 展示，不可把课程名称、成绩、日期当作真实用户资料。

| 内容 | 中文 | English | 适合的镜头 |
| --- | --- | --- | --- |
| 全部课程 / 30 天日历 | [home-zh.png](../site/assets/product/home-zh.png) | [home-en.png](../site/assets/product/home-en.png) | 全景、日历、下一项截止 |
| 课程总览 | [overview-zh.png](../site/assets/product/overview-zh.png) | [overview-en.png](../site/assets/product/overview-en.png) | 左侧选课、三个核心板块 |
| 作业详情 | [assignments-zh.png](../site/assets/product/assignments-zh.png) | [assignments-en.png](../site/assets/product/assignments-en.png) | 展开作业要求 |
| 公告详情 | [announcements-zh.png](../site/assets/product/announcements-zh.png) | [announcements-en.png](../site/assets/product/announcements-en.png) | 课程通知、正文 |
| 课件列表 | [files-zh.png](../site/assets/product/files-zh.png) | [files-en.png](../site/assets/product/files-en.png) | 文件类型、批量下载入口 |

可对 PNG 做缓慢推近、局部特写或转场，保留足够阅读时间和必要上下文。不要用浏览器演示录像冒充最新客户端；浏览器演示是历史 0.3.6。所有静态图、模拟进度、示例对话与虚构数据动画都应有清楚的素材类型标注，尤其不要添加假的真实账号同步、下载完成或 AI 成功结果。

图标：`site/assets/favicon.svg`。客户端原生小组件说明图：`site/assets/widget-preview.svg` / `widget-preview-en.svg`。AI 说明图：`site/assets/ai-homework.svg` / `ai-homework-en.svg`。后二者仅为插画，不是实际功能录像；具体素材类别见 `site/assets/SOURCES.md`。

现有资料不包含首次登录 / MFA 视频、实际下载进度视频、学校切换 / 语言切换操作视频、AI 真正返回结果视频和原生小组件现场录像。制作需要这些镜头时，应在隔离的虚构演示环境重新录制，或使用明确标注的流程说明卡。

## 学校表述怎么写

可以写：“面向使用 Canvas 的大学用户”“内置 11 校入口”“覆盖六大洲的 Canvas 预设”。不能写：“支持全球所有大学”“11 所学校全部实测”“只要登录成功就保证所有课件都能下载”。学校公开材料只证明其 Canvas 部署，不证明第三方客户端的全部操作可用。

NUS 当前证据是用户反馈登录和正常使用；其他账号、不同学期、不同权限仍可能不同。HKUST(GZ) 是原有默认学校；其名字出现在虚构数据截图的标题栏，不等于截图是学校官方背书。

## 宣传事实与限制

| 可以表达 | 必须同时理解的边界 |
| --- | --- |
| 工具免费、开源 | 用户所选 AI 服务可能收费 |
| 本地课程缓存与下载 | 同步、登录、下载、检查更新需要网络；AI 启用后向所选服务发送相关材料 |
| 中英文切换 | 切换界面语言，不会翻译课程原文 |
| 批量下载课件 | 当前可见文件列表；受课程权限与学校下载限制影响 |
| 截止提醒 | 来源为最近同步；客户端需运行，系统通知权限可能影响展示 |
| Mac 原生小组件 | macOS 14+，显示缓存，刷新由系统调度 |
| MCP 查询课程 | 独立服务，需另外配置，查询缓存并关注同步时间 |
| 多校数据隔离 | 不提供同校多账号界面，也不提供跨学校合并日历 |
| 插件安装 / 卸载 / 重装 | 随包副本，不是在线插件商店 |
| 可检查新版 | 目前完整安装包更新，不是已经上线的小包热更新 |

不要承诺提高成绩、自动代交、自动完成作业、绕过 MFA / 下载权限、保证不漏截止、百分之百正确 AI、所有功能完全离线、所有平台已实测或无需安装的新版本热更新。

## 新录像的取材流程

优先用真实客户端、默认外观和虚构课程。登录 / 同步必须明确是演示还是学校实际操作；实际学校账号需要由账号持有人完成认证。录制不要包含密码、MFA、Cookie、API Key、真实学生姓名、学号和未授权私人课程材料。若只展示现有 PNG，不需要取得用户真实课程数据。

剪辑应让主要信息停留可读，不把大量正文做成快速滚动字幕。现有官网的滚动卡片可作为视觉风格参考，产品能力仍以真实客户端和本资料为准。

## English summary for the video agent

Prioritize bulk course-file downloads, assignments, the 30-day calendar and announcements. Use direct feature labels. AI is optional and off by default; Mac widgets and MCP have separate requirements. Use the actual 4.1.2 PNGs in `site/assets/product/`, not the historical browser demo as a current-client recording. All PNG course data is fictional. School presets are not proof of account-level acceptance. Do not simulate a successful live sync/download without labeling it as an illustration. The product has no working code-package hot updater or online plugin marketplace yet.
