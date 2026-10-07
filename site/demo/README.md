# Product interface demonstration

This directory contains a static-browser copy of `app/renderer/` for the local
website's product preview. The application source and packaged app are unchanged.
All course, assignment, announcement, file and report content is synthetic and
explicitly labelled as demonstration data.

Serve `website/` with any static HTTP server and open:

- `/demo/index.html` — default white appearance and the 30-day calendar.
- `/demo/index.html?course=1` — the four-board course overview.
- `/demo/index.html?course=1&section=assignments` — assignment board.
- `/demo/index.html?course=1&section=announcements` — announcement board.
- `/demo/index.html?course=1&section=files` — course materials board.
- `/demo/index.html?course=1&section=analysis` — prewritten sample study report.
- `/demo/index.html?theme=claude` — the app's existing warm-white theme.
- `/demo/index.html?story=1` — scroll-tour presentation, directed by the parent website.

Recommended iframe or screenshot size: 1200 × 760 or 1280 × 800. The actual
desktop renderer is deliberately preserved; this is not a new mobile application.

`demo-bridge.js` replaces the Electron preload API with in-memory fixtures. Course
navigation, calendar items, assignment details, announcement expansion and board
switching work. Service, update, settings and file actions display a local demo
message. No Canvas authentication, AI calls, downloads, telemetry, filesystem
access or remote fonts are used. A restrictive CSP also disables connections.

`app.js`, `style.css`, `fonts/` and `vendor/` originate from the app renderer at
version 0.3.6. The changes in the copied `app.js` are a separate demo theme
storage key, support for the chosen initial demo theme, and a guarded emoji
observer that disconnects when its iframe unloads. `index.html` loads the
demo bridge, adds a data label, viewport/noindex metadata and a browser-only CSP.
`demo.css` provides the data label, toast wrapping, desktop minimum width and
the presentation-only sync overlay; it disables animation in scroll-tour mode.
Dates are relative to the visitor's current day, so the sample calendar remains
populated over time; they are not a real academic calendar.

## Current website presentation (2026-10-07)

The website uses ordinary page flow. Since 2026-10-08 its primary product surfaces use user-supplied actual Mac 4.1.2 PNG screenshots. The historical 0.3.6 browser renderer is an additional, explicitly labelled interactive experience. Each of its seven feature demonstrations
has a fixed title, description and preview. Page scrolling does not change the
hero iframe or send scene commands. Legacy `?story=1` bridge support is isolated
and is not used by either language page.

The full interactive demo opens in a native dialog. The website demo stylesheet
adds narrow-viewport layouts for course navigation, calendar and focused boards.
These presentation changes do not change the desktop client or its packages.
Demo course codes are MATH101, CS102, DESIGN201, PHYS104 and IOT205; the course,
assignment and report fixtures remain fictional. The demo data label lives in
normal layout flow, rather than a corner overlay.

The bundled Source Serif 4 font remains under its included SIL Open Font License.
The marked vendor bundle and the renderer preserve their source notices.

Default color and typography tokens were updated from the current client base appearance on 2026-10-07. Optional historical themes remain in this isolated demo.
