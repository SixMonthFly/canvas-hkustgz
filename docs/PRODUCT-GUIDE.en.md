# Canvas Manager: product and usage guide

Updated **2026-10-09** for public desktop release **4.1.2**. Website deployments do not upgrade the desktop app.

[中文完整版](PRODUCT-GUIDE.zh-CN.md) · [Video brief](VIDEO-BRIEF.zh-CN.md) · [Release evidence](RELEASE-NOTES.md) · [Structured facts](product-facts.json)

## What it does

Canvas Manager is a free, open-source desktop tool for people whose courses use Instructure Canvas. It reads courses, assignments, announcements and files through the school's Canvas API, provides a next-deadline view and a 30-day calendar, and downloads course files in bulk to your computer. Basic functions do not require AI or a separate Canvas Manager account.

Plain description: **“Download course files in bulk. View assignments and announcements. Track course deadlines in one calendar.”** This independent project is not affiliated with a university or Instructure. Your school's Canvas remains the authority for course content, permissions and deadlines.

## Which schools can use it?

The relevant factor is the LMS, not university type or country. The course must use Canvas, the user must have a valid school account with course access, and the school's authentication, MFA, network rules and API permissions must permit the client to read the data. File downloads must also be allowed.

**4.1.2 includes 11 selectable school presets across six continents:**

| Region | University | Configured Canvas endpoint |
| --- | --- | --- |
| Mainland China / Asia | HKUST (Guangzhou) | https://hkust-gz.instructure.com |
| Hong Kong / Asia | HKUST | https://canvas.ust.hk |
| Hong Kong / Asia | City University of Hong Kong | https://canvas.cityu.edu.hk |
| Singapore / Asia | National University of Singapore (NUS) | https://canvas.nus.edu.sg |
| Singapore / Asia | Singapore University of Social Sciences (SUSS) | https://canvas.suss.edu.sg |
| United States / North America | Harvard University | https://canvas.harvard.edu |
| United Kingdom / Europe | University of Oxford | https://canvas.ox.ac.uk |
| Australia / Oceania | University of Melbourne | https://canvas.lms.unimelb.edu.au |
| New Zealand / Oceania | University of Auckland | https://canvas.auckland.ac.nz |
| South Africa / Africa | University of the Witwatersrand (Wits), ulwazi | https://ulwazi.wits.ac.za |
| Chile / South America | Pontificia Universidad Católica de Chile | https://cursos.canvas.uc.cl |

University-source links and per-school evidence notes are in [schools.json](schools.json) and the [Chinese guide](PRODUCT-GUIDE.zh-CN.md). Preset inclusion and official endpoint verification do not prove account-level authentication, MFA, synchronization or download acceptance. NUS has a user report of successful sign-in and normal operation, not certification for every account. The six new presets still require per-school account testing.

There is no arbitrary school-URL input or automatic school discovery. Other Canvas schools need a new preset and validation. Moodle, Blackboard, Brightspace and Learnova are not supported adapters. If a university has multiple LMSs, only its Canvas courses are covered. Submit the university name, public Canvas URL and official reference through the [source repository's issues](https://gitee.com/xxouyang123/hkustgz_diy_canvas/issues); do not send passwords, MFA codes or cookies.

## Install and start

Get the app from the [website](https://sixmonthfly.github.io/canvas-hkustgz/en/) or [v4.1.2 Release](https://github.com/SixMonthFly/canvas-hkustgz/releases/tag/v4.1.2).

- **Mac:** macOS 13+, Apple Silicon. Open the DMG, drag the app into Applications and launch it. The package is locally signed but not Apple-notarized. Mac installation and signature checks were performed.
- **Windows:** Windows 10/11 x64. Run the EXE for a per-user installation. The installer is unsigned; its payload was checked, but Windows runtime acceptance has not been performed.
- Native Mac widgets additionally require **macOS 14+**. No current public Intel Mac, Linux, iOS or Android package is provided.
- Release assets include `SHA256SUMS.txt`; package sizes and checksums are listed in [product-facts.json](product-facts.json).

## First launch

1. The welcome guide opens automatically. Choose Simplified Chinese or English.
2. Choose the school. The selection is a draft until you enter the app.
3. Enter the app. A school change may restart the app; the guide resumes afterward.
4. The practical step is a non-modal card, so the app remains clickable. Click **Sign in and sync**, or the app's upper-right **Sync** button.
5. Complete your school's sign-in, SSO and MFA in its login window. Basic desktop use does not require manually obtaining a Canvas API token.
6. Wait for sync to complete. Courses appear on the left; All courses shows the next deadline and 30-day calendar.
7. Finish the guide, or explicitly skip it. Closing it or pressing Esc means “finish later.” Until completed or skipped, it resumes on later launches. Existing course data does not implicitly complete the guide. You can replay it from Settings.

Finishing the guide records tutorial completion; it does not prove that login, sync or downloads succeeded.

## Daily use

**Calendar:** choose All courses to see the next deadline and the next 30 days, with colors per course. Dates and submission state come from the latest sync, not a live server feed.

**Assignments:** select a course, filter by status, open the assignment requirements and deadline, and use the original Canvas link where provided. Submit assignments and take quizzes through your school's official Canvas workflow; this is not an automatic submission or exam tool.

**Announcements:** read and expand course announcements, or open the original Canvas page. Availability depends on sync and permissions.

**Bulk files:** select a course and open its files board. Download one file or click Download all. The batch processes the current visible file list, shows progress and errors, and saves files in the current school's local data directory, organized by course. A listed file is not necessarily already downloaded. School download restrictions are not bypassed.

**Sync and reminders:** sync manually to refresh data. While running, the client checks cached pending assignments and can notify at 24-hour and 1-hour deadline thresholds, subject to OS notification settings. It attempts automatic sync approximately every 30 minutes when a valid session is available; it cannot complete SSO/MFA for you. Client notifications require the app process to remain running.

**Language:** change Chinese / English in Settings → General. This changes the UI, not the language of school-authored materials. Active sync/download/plugin work can block changes.

**School:** choose a school in Settings → General, save and restart, then sync. Active tasks block switching. Each school has separate course data, sessions, files and school-specific plugin configuration/reports. There is no multi-account interface for a single school and no combined cross-school calendar.

**Themes:** the base white/gray/blue UI works without a theme. Themes are installed on demand; previous installations are retained. The app uses its independent C + check icon.

## Optional functions

**AI assistant:** off by default. Enable it in Settings → Plugins, configure a supported provider/model and authentication, then save through Settings. Connection tests and capability detection use drafts and do not save them. Features include assignment explanations/plans, announcement summaries and course analysis. Relevant material is sent to the configured provider; that provider may charge. AI answers need review. Disabling AI does not disable the basic course tool.

Bundled plugins can be installed, uninstalled and reinstalled. Uninstalling preserves courses, configuration and reports. Reinstallation uses the bundled copy; it is not an online plugin download. There is no online marketplace or arbitrary third-party plugin installation.

**Native Mac widgets:** enable Mac system widgets in Settings → Plugins, then right-click the desktop, choose Edit Widgets and search for Canvas. Small, medium and large sizes show cached pending assignments over the next seven days (rolling 168 hours), with links back to the app. Cached content can remain visible after the app exits; macOS controls WidgetKit refresh timing. This is not the removed floating desktop card and is not available as a Windows WidgetKit feature.

**Separate MCP service:** a compatible AI client can query synced courses, pending assignments, details and cache age, or request sync through the running app. Example: “What is due this week?” The service requires separate source retrieval, Node dependencies, build and AI-client configuration. See the [MCP documentation](https://gitee.com/xxouyang123/hkustgz_diy_canvas/blob/master/mcp-server/README.md). It follows the active school and is updated independently. Results sent to an external AI client/model are subject to that client's data handling; do not describe this as entirely offline inference.

## Data and updates

Installed data lives under `~/Library/Application Support/canvas-manager/data/` on macOS and `%APPDATA%\canvas-manager\data\` on Windows. HKUST(GZ) retains the legacy root; other schools use `schools/<schoolId>/`, with course downloads under `files/<course code>/`. Login sessions use separate local Electron partitions per school.

Existing caches and downloaded files can be viewed locally. Initial sync, new data and new downloads require network access. The app connects to school authentication/Canvas services, GitHub update metadata and any AI provider you enable. Local diagnostic logs are not automatically uploaded; they can be disabled or exported in Settings. “Local data” does not mean “never connects to the internet.”

Check for updates currently opens the full installer for the platform after reading the website's `release.json`. Quit the app before replacing/installing it. Courses, preferences and sign-in sessions are retained; back up important data. **There is no signed code-package updater, automatic rollback or reinstall-free hot update yet.** Website publishing and client releases are separate.

## Media and evidence

[screenshots.json](screenshots.json) lists ten 2400×1520 PNGs in Chinese/English from the actual packaged Mac 4.1.2 UI. They use isolated fictional course data, the HKUST(GZ) preset and default appearance. They are not evidence of live school login/sync/download success.

AI/MCP/API/widget illustrations are explanatory, not client recordings. The interactive browser demo uses a historical 0.3.6 interface and fictional data; it is not the 4.1.2 client. Source is on [Gitee](https://gitee.com/xxouyang123/hkustgz_diy_canvas); this GitHub repository contains public documentation, website assets and releases, not private account data or app source.
