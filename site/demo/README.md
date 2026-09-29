# Product interface demonstration

This directory contains a static-browser copy of `app/renderer/` for the local
website's product preview. The application source and packaged app are unchanged.
All course, assignment, announcement, file and report content is synthetic and
explicitly labelled as demonstration data.

Serve `website/` with any static HTTP server and open:

- `/demo/index.html` — actual HKUST theme and the 30-day calendar.
- `/demo/index.html?course=1` — the four-board course overview.
- `/demo/index.html?course=1&section=assignments` — assignment board.
- `/demo/index.html?course=1&section=files` — course materials board.
- `/demo/index.html?course=1&section=analysis` — prewritten sample study report.
- `/demo/index.html?theme=claude` — the app's existing warm-white theme.

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
`demo.css` provides only the data label, toast wrapping and desktop minimum width.
Dates are relative to the visitor's current day, so the sample calendar remains
populated over time; they are not a real academic calendar.

The bundled Source Serif 4 font remains under its included SIL Open Font License.
The marked vendor bundle and the renderer preserve their source notices.
