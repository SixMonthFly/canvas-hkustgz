# Canvas Manager：产品与使用说明

资料更新：2026-10-09。对应公开客户端 **4.1.2**。本说明供用户、宣传视频作者和取材 Agent 使用；网页更新不代表客户端版本升级。

[English guide](PRODUCT-GUIDE.en.md) · [宣传视频资料](VIDEO-BRIEF.zh-CN.md) · [版本与验证记录](RELEASE-NOTES.md) · [机器可读资料](product-facts.json)

## 这个工具做什么

Canvas Manager（Canvas 课程管理）是免费、开源的 Canvas 桌面工具。它通过学校的 Canvas API，同步你有权限访问的课程、作业、公告和课件，在本机集中查看截止日期、阅读课程信息、批量下载课件。基础功能不要求单独注册本工具账号，也不要求开启 AI。

适合已经有学校 Canvas 账号、同时管理多门课程的用户。它是独立项目，与大学和 Instructure Canvas 没有官方隶属关系。学校仍负责课程发布、账号认证和访问权限；课程内容与截止日期以学校 Canvas 为准。

可以直接使用的介绍：**“批量下载课件，集中查看作业和公告，用一个日历查看课程截止日期。”**

## 支持什么样的学校

判断标准是学校实际使用的学习平台，而不是国家、学校排名或大学类型。

1. 学校的相关课程使用 **Instructure Canvas**，包括 `*.instructure.com` 或学校自己的 Canvas 域名。
2. 用户有有效的学校账号及课程访问权限。
3. 学校的登录流程可以在客户端登录窗口完成，包括可能出现的 SSO、MFA 和校外网络要求。
4. 登录后允许当前账号读取所需 Canvas API；学校未禁止相应文件下载。
5. 当前客户端已收录该学校的入口。**4.1.2 没有任意输入学校网址的入口**；其他 Canvas 学校需要补充预设并完成适配验证。

不是所有大学都使用 Canvas，也不是只要用了 Canvas 就一定能完整同步。Moodle、Blackboard、Brightspace、Learnova 等其他平台不在当前适配范围内。一个学校可能同时使用多个 LMS，本工具只覆盖它的 Canvas 课程。

### 4.1.2 内置的 11 所学校

表中的地址来自客户端学校配置；“预设”指可在应用里选择该学校，不等于已完成该校每种账号的登录、MFA、同步和下载实测。来源链接是学校公开资料，不是学校对本工具的认证或背书。

| 地区 / 大洲 | 学校 | Canvas 入口 | 公开依据 / 状态说明 |
| --- | --- | --- | --- |
| 中国内地 / 亚洲 | 香港科技大学（广州）· HKUST (Guangzhou) | https://hkust-gz.instructure.com | 原有默认学校；当前演示截图选中此学校，不证明截图中的课程是真实课程 |
| 中国香港 / 亚洲 | 香港科技大学 · HKUST | https://canvas.ust.hk | [学校课程说明](https://seng.hkust.edu.hk/sites/default/files/IMCE/UG/Course%20Syllabus/Spring_2024-2025/ENTR1001_Spring%202024-25.pdf)；账号实测需按校验收 |
| 中国香港 / 亚洲 | 香港城市大学 · City University of Hong Kong | https://canvas.cityu.edu.hk | [学校学习资源](https://www.ds.cityu.edu.hk/en/student-enrichment/academic-advising)；账号实测需按校验收 |
| 新加坡 / 亚洲 | 新加坡国立大学 · National University of Singapore (NUS) | https://canvas.nus.edu.sg | [学校登录说明](https://nus.atlassian.net/wiki/spaces/canvasstudent/pages/12550496/Log%2Bin%2Bto%2BCanvas)；已有用户反馈登录与正常使用，不代表所有账号验收通过 |
| 新加坡 / 亚洲 | 新加坡社科大学 · Singapore University of Social Sciences (SUSS) | https://canvas.suss.edu.sg | [学校资源指南](https://learningservices.suss.edu.sg/assets/pdf/QuickGuideTo5EssentialResources.pdf)；[学校 LMS 登录入口](https://lmslogin.suss.edu.sg/)；仅覆盖 Canvas，其他 LMS 不适用 |
| 美国 / 北美洲 | 哈佛大学 · Harvard University | https://canvas.harvard.edu | [学校 Canvas 资料](https://atg.fas.harvard.edu/canvas-behind-scenes)；新增入口预设，账号实测待逐校验收 |
| 英国 / 欧洲 | 牛津大学 · University of Oxford | https://canvas.ox.ac.uk | [学校 Canvas 登录页](https://login.canvas.ox.ac.uk/)；新增入口预设，账号实测待逐校验收 |
| 澳大利亚 / 大洋洲 | 墨尔本大学 · University of Melbourne | https://canvas.lms.unimelb.edu.au | [学校 LMS 说明](https://study.unimelb.edu.au/study-with-us/online-courses/current-students/online-systems-support/lms)；新增入口预设，账号实测待逐校验收 |
| 新西兰 / 大洋洲 | 奥克兰大学 · University of Auckland | https://canvas.auckland.ac.nz | [学校 Canvas 资料](https://teachwell.auckland.ac.nz/canvas/canvas-baseline-practices-2/2-orientation-to-course/)；新增入口预设，账号实测待逐校验收 |
| 南非 / 非洲 | 金山大学 · University of the Witwatersrand (Wits) | https://ulwazi.wits.ac.za | [学校 ulwazi 说明](https://www.wits.ac.za/ulwazi/)；ulwazi 使用 Canvas，新增入口预设，账号实测待逐校验收 |
| 智利 / 南美洲 | 智利天主教大学 · Pontificia Universidad Católica de Chile | https://cursos.canvas.uc.cl | [学校 Canvas 说明](https://cddoc.uc.cl/servicios/canvas/)；新增入口预设，账号实测待逐校验收 |

共 11 个预设，覆盖亚洲、北美洲、欧洲、大洋洲、非洲和南美洲六大洲。官方入口公开核实与真实账号验收是两个不同的证据层级。上述公开依据来自预设收录记录；网页可能迁移，不能据此保证任意时间登录可用。

### 你的学校没有在列表里

当前没有自动发现学校、任意网址接入或跨 LMS 转换功能。可以通过[源码仓库 Issue](https://gitee.com/xxouyang123/hkustgz_diy_canvas/issues)提供学校名称、公开 Canvas 入口和官方说明；无需提供密码、验证码、Cookie 或私人课程材料。添加预设仍需验证学校登录、学生 API 权限、课程分页、公告、图片、课件下载和会话过期后的重新登录。

## 下载与安装

[中文官网](https://sixmonthfly.github.io/canvas-hkustgz/) · [English website](https://sixmonthfly.github.io/canvas-hkustgz/en/) · [正式 Release v4.1.2](https://github.com/SixMonthFly/canvas-hkustgz/releases/tag/v4.1.2)

| 平台 | 当前公开包 | 要求 | 验证边界 |
| --- | --- | --- | --- |
| Mac | [CanvasManager-4.1.2-mac-arm64.dmg](https://github.com/SixMonthFly/canvas-hkustgz/releases/download/v4.1.2/CanvasManager-4.1.2-mac-arm64.dmg) | macOS 13+，Apple Silicon（M 系列） | 已做 Mac 本机安装和签名校验；本地签名，未 Apple 公证 |
| Windows | [CanvasManager-Setup-4.1.2-x64.exe](https://github.com/SixMonthFly/canvas-hkustgz/releases/download/v4.1.2/CanvasManager-Setup-4.1.2-x64.exe) | Windows 10 / 11，x64 | 安装器载荷核对通过；未签名，未完成 Windows 实机运行验收 |

Mac：打开 DMG，把应用拖入 Applications（应用程序），再启动。Windows：运行 EXE，按当前用户安装并启动。首次打开可能显示系统开发者验证提示，请先核对来源和官网 FAQ。当前没有公开的 Intel Mac、Linux、iOS 或 Android 安装包；仓库里的历史构建配置不等于这些平台已发布。

Release 同时提供 [SHA256SUMS.txt](https://github.com/SixMonthFly/canvas-hkustgz/releases/download/v4.1.2/SHA256SUMS.txt)，可用于检查下载完整性。具体大小和 SHA-256 见 [product-facts.json](product-facts.json)。

## 第一次启动：选择语言、学校，再登录同步

1. **启动应用。** 首次启动自动出现使用指引，不需要先去设置里寻找。
2. **选择简体中文或 English。** 后续也能在「设置 → 常规」切换语言。
3. **选择学校。** 选择先作为指引草稿保存；进入应用时才应用学校配置。更换当前学校可能需要重启。
4. **进入实际操作步骤。** 如果发生学校切换重启，指引继续之前的进度。此时指引变为不遮挡操作的非模态小卡片，主界面可以点击。
5. **点击「登录并同步」，或右上角「同步」。** 在学校登录窗口完成账号登录、SSO 和 MFA。无需为本工具另建账号；基础桌面使用无需手动申请 Canvas API Token。
6. **等待同步完成。** 课程出现在左侧；「全部课程」显示下一项截止与未来 30 天日历，选择具体课程查看作业、公告和课件。
7. **选择「完成指引」。** 也可以主动「跳过指引」。关闭窗口或按 Esc 只是稍后再看，未完成且未主动跳过的指引会在下次启动继续。指引是否完成由独立状态保存，不用“已有课程数据”推断。设置里的入口用于重新查看。

“完成指引”只记录用户结束教程，不代表学校认证、同步或下载已经成功。宣传画面应根据实际操作结果展示成功状态。

## 日常功能怎么用

### 查看全部课程与截止日期

点击左侧「全部课程」。顶部展示最近一项截止任务，下方按课程颜色显示未来 30 天的截止日期。数据来自最近一次同步；没有截止日期的作业不会凭空生成日期。不要将它描述为实时追踪学校后台变化。

### 查看作业要求

选中课程，查看作业板块。可按状态筛选，展开作业查看说明、截止日期和同步得到的提交状态，并按界面提供的链接打开原 Canvas 页面。提交状态取决于最近一次同步。

本工具不是自动代交作业或自动考试工具。需要提交作业、完成测验等操作时，使用学校 Canvas 提供的原流程。

### 查看公告

选中课程，查看公告板块，按日期阅读、展开完整内容或打开原 Canvas 页面。新公告是否出现取决于同步是否完成及账号权限。

### 批量下载课件

1. 选中课程，进入课件 / 文件板块。
2. 需要一个文件时，点击该文件的下载按钮；需要批量处理时，点击「全部下载」。
3. 批量下载处理当前可见文件列表，逐项显示进度和失败信息；下载到本机后可打开本地文件。
4. 文件按课程组织，保存在当前学校的数据目录下。已保存的文件可以本地查看；列表中只有名称不代表文件已经下载。

学校禁止学生下载的文件、不可访问的附件或过期登录会话不会被绕过。不要把“全部下载”宣传为跨学校、所有课程、无权限限制的一键抓取。

### 同步与截止提醒

主动点击「同步」可重新拉取数据。客户端运行时会检查已同步的待交作业，在截止前 24 小时 / 1 小时档位发出系统通知，并记录已经提醒的任务以减少重复通知。通知展示受系统权限和设置影响。

有可用登录态时，客户端尝试定时同步（当前实现约每 30 分钟）；自动同步不会替用户完成 SSO 或 MFA，登录失效后需要主动同步重新登录。提醒需要客户端进程运行，不能宣称完全退出后仍由客户端持续提醒。

### 切换语言、学校与外观

- **语言：** 设置 → 常规，选择中文 / English 并按界面保存；同步、下载等活动进行时可能阻止切换。双语指应用界面，不会自动翻译学校课程正文。
- **学校：** 设置 → 常规 → 学校，选择并保存，应用自动重启；再同步该学校。同步、下载或插件任务进行时会阻止切校，以免打断任务。
- **隔离：** 课程缓存、登录会话、下载和学校相关插件配置 / 报告按学校隔离；切回可继续使用该校已有本地数据。当前没有同一学校多个账号的独立管理界面，也没有把不同学校课程合并进同一日历的功能。
- **外观：** 默认基础白灰蓝界面，采用独立的 C + check 图标。皮肤首次按需安装，已安装的皮肤保留；没有安装皮肤也可以使用基础功能。

## 可选插件

### AI 助手

设置 → 插件，安装或启用 AI 助手，再配置支持的 AI 服务、模型及认证信息，在设置页统一保存。首次默认关闭；测试连接或能力探测使用当前草稿，不代表已经保存配置。

开启后可使用作业解读、作业方案、公告摘要和课程分析等功能。相关课程材料会按所用功能发送给用户配置的 AI 服务商；第三方 API 可能收费。免费开源指本工具，不代表外部 AI 服务永久免费。AI 输出需自行核对，不保证正确或获得成绩。

停用 AI 不影响基础课程、日历、公告和下载。随包插件支持安装、卸载和重新安装；卸载保留课程数据、配置和报告，重新安装从随包副本恢复。没有在线插件市场或任意第三方代码安装入口。

### Mac 原生系统小组件

要求 macOS 14+。设置 → 插件，启用「Mac 系统小组件」，随后在桌面右键 → 编辑小组件，搜索 Canvas 并添加。支持小、中、大尺寸，显示最近同步的未来七天（滚动 168 小时）待交作业，并可点击返回应用。

小组件使用最近的本地快照；客户端退出后仍可展示缓存，刷新由 macOS WidgetKit 调度，不是秒级实时同步。该功能是 Mac 原生小组件，不是旧的独立桌面悬浮卡片，也没有 Windows 对应原生 WidgetKit 功能。

### 独立 MCP 服务

MCP 让兼容 AI 客户端查询本机已同步课程、待交作业、作业详情和缓存更新时间，也可通过正在运行的桌面应用触发同步。示例问题：“这周有哪些作业到期？”“这项作业要求是什么？”

这是独立程序，需要取得源码、安装 Node 依赖、构建并配置 AI 客户端。不能在装好桌面 App 后直接宣称所有 AI 客户端自动连接。详见[源码仓库 MCP 文档](https://gitee.com/xxouyang123/hkustgz_diy_canvas/blob/master/mcp-server/README.md)。

MCP 跟随客户端已经启用的学校，查询缓存时应同时关注最后同步时间。MCP 服务独立更新；使用外部 AI 客户端时，传给模型的工具结果由该客户端和所选模型服务处理，不能宣传为 AI 推理完全离线。

## 数据放在哪里，什么时候联网

安装版课程缓存、设置和下载位于应用用户数据目录：

- macOS：`~/Library/Application Support/canvas-manager/data/`
- Windows：`%APPDATA%\canvas-manager\data\`
- 原默认学校 HKUST(GZ) 保留原根目录；其他学校位于 `schools/<schoolId>/`，下载位于当前学校目录的 `files/<课程代码>/`。
- 学校登录会话也保留在本机的独立 Electron 登录分区中，不同学校不共用同一个分区。

已有缓存可在不重新连接学校时查看，但首次同步、新数据和未下载文件需要网络。应用不会提供项目方的课程托管云；也不等于“从不联网”。联网包括学校认证 / Canvas API / 附件、GitHub 更新信息和用户主动启用的 AI 请求。诊断记录当前只在本地生成，不自动上传，可在设置中关闭或导出。

## 更新方式

4.1.2 的「检查更新」读取官网 `release.json`，发现新版后打开对应平台的完整安装包下载链接；退出应用，再安装或替换应用。课程数据、设置和登录会话应保留，重要资料仍应自行备份。

**签名代码小包、固定更新启动器、自动失败回退和免重装热更新当前尚未实现。** 官网可以独立发布，客户端不会因官网改版而自动升级。插件从随包副本重新安装也不等于联网更新。

## 常见问题

| 情况 | 应怎样理解或处理 |
| --- | --- |
| 学校不在列表 | 当前无自定义网址；提供公开入口申请新增适配 |
| 已登录但没有课程 | 先确认学校、账号、课程归属和访问权限；检查同步结果，不应伪造成功状态 |
| 登录需要 MFA / VPN | 按学校要求完成认证或网络接入；本工具不会绕过要求 |
| 同步后缺少文件或公告 | 可能与 API 权限、课程发布状态或学校配置有关，需要核实具体返回结果 |
| 下载失败 | 核对会话、网络和下载权限；保留失败信息，不把失败表现成“已下载” |
| 上次同步过，但课程变化没出现 | 缓存不是实时数据，主动同步并检查最近同步时间 |
| 关闭指引后再次出现 | 关闭表示稍后继续；选择完成或主动跳过才停止自动显示 |
| 安装完成却找不到 Mac 小组件 | 确认 macOS 14+、插件已启用，再到系统编辑小组件；系统注册和刷新可能延迟 |
| AI 不显示 | 默认关闭，在插件设置启用；还需有效服务配置 |

## 公开资料与截图

[真实客户端截图清单](screenshots.json)列出中英文共 10 张 2400×1520 PNG。它们由未修改的打包 Mac 4.1.2 客户端在隔离的虚构课程数据上截图，是真实 UI，不是真实学校数据或在线同步成功证据。学校选择为 HKUST(GZ)，使用默认外观。

网站上的 AI、MCP、API 和小组件插画是说明性素材，不能冒充客户端运行录像。浏览器交互演示使用历史 0.3.6 界面和虚构数据，不是最新 4.1.2 客户端验收。

[应用源码](https://gitee.com/xxouyang123/hkustgz_diy_canvas) · [公开安装包与官网仓库](https://github.com/SixMonthFly/canvas-hkustgz) · [视频取材说明](VIDEO-BRIEF.zh-CN.md)
