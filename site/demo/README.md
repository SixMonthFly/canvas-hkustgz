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

## Scroll-tour mode

The parent page advances through `sync`, `home`, `overview`, `assignments`,
`announcements`, `files` and `analysis` as its chapter text passes through the
viewport. Its inert iframe cannot capture pointer input or require a click to
advance. Each scene uses the renderer's existing navigation and board controls,
resets detail/filter/scroll state and cancels renderer animation. The parent fades
the iframe out before sending a new scene and fades it back in after the
`canvas-story-applied` acknowledgement. Reduced-motion settings make the switch
instant. The sync overlay
is a labelled illustration, not a real login or synchronization.

Only `?story=1` enables the message API. The child accepts
`{ type: 'canvas-story', step: '<scene>' }` from its same-origin parent, validates
the scene against the list above and retains a pending scene until rendering is
ready. It responds with `canvas-story-ready` and `canvas-story-applied` messages.
The parent validates the iframe source and origin and resends its current scene
on iframe load. Serve over HTTP so both documents have a normal matching origin.
The ordinary demo does not accept these scene messages. Both modes retain the
mock API and blocked service controls; neither makes remote calls.

The surrounding website uses Songti system fonts for headings and PingFang or
other system sans-serif fonts for body copy. Its separate AI SVG shows a complete
conversation from the moment it enters view: a question, an MCP lookup and a
fictional answer. Three scroll chapters explain the interaction while the entire
image stays visible, without clipping or a progressive reveal; it does not call AI.
These website changes are currently local preview work pending publication.

The bundled Source Serif 4 font remains under its included SIL Open Font License.
The marked vendor bundle and the renderer preserve their source notices.

Default color and typography tokens were updated from the current client base appearance on 2026-10-07. Optional historical themes remain in this isolated demo.
