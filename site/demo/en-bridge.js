/*
 * Browser-only bridge for the actual Canvas Manager renderer.
 * Every course, assignment, file and report below is synthetic demo content.
 * No Electron IPC, Canvas session, AI service, filesystem or download is used.
 */
(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const storyMode = params.get('story') === '1';
  const storySteps = new Set(['sync', 'home', 'overview', 'assignments', 'announcements', 'files', 'analysis']);
  let rendererReady = false;
  let pendingStoryStep = 'sync';
  let storyRevision = 0;
  if (storyMode) document.documentElement.dataset.storyMode = 'true';
  const requestedTheme = params.get('theme');
  window.demoTheme = ['hkust', 'claude', 'chatgpt', 'default'].includes(requestedTheme)
    ? requestedTheme : 'default';
  document.body.dataset.theme = window.demoTheme;

  const now = new Date();
  const dateAt = (days, hour = 23, minute = 59) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const demoCourses = [
    { id: 1, code: 'ROAS5120 (L01)', name: "Formal Verification and Control" },
    { id: 2, code: 'DSAA5001 (L01)', name: "Foundations of Data Science" },
    { id: 3, code: 'PLED5001 (T01)', name: "Communicating Research in English" },
    { id: 4, code: 'AIAA5001 (L01)', name: "Introduction to Artificial Intelligence" },
    { id: 5, code: 'IOTA5002 (L01)', name: "Internet of Things Systems" },
  ];
  const plans = [
    [
      ["Problem Set 02 · State space", 1], ["Lab 03 · Controller design", 7],
      ['Project Proposal', 14], ["Problem Set 03 · Stability", 22],
    ],
    [
      ["Assignment 03 · Regression and classification", 3], ["Exploratory data report", 10],
      ["Group project · Progress report", 18], ["Assignment 04 · Model evaluation", 27],
    ],
    [
      ['Research Abstract', 5], ['Literature Review', 12],
      ['3-minute Presentation', 20],
    ],
    [
      ["Lab 02 · Search algorithms", 4], ['Reading Notes', 11],
      ["Assignment 02 · Neural networks", 17], ['Project Milestone', 25],
    ],
    [
      ["Sensor lab report", 6], ["System design proposal", 15], ["Demo Day · Project showcase", 24],
    ],
  ];
  const byCourse = {};
  const filesBy = {};
  const annBy = {};
  const reports = {};

  demoCourses.forEach((course, courseIndex) => {
    const cid = course.id;
    const code = course.code.split(' ')[0];
    byCourse[cid] = plans[courseIndex].map(([name, offset], index) => ({
      id: cid * 100 + index + 1,
      name,
      published: true,
      due_at: dateAt(offset),
      points: index === 2 ? 30 : 20,
      url: 'https://demo.invalid/assignment',
      description: `<h2>${name}</h2><p>This is a fictional assignment for the interface demo.</p><p>Use this week's course material to analyze the problem, design a method and discuss your results. Explain your reasoning, experiments and derivations clearly.</p><h3>Submission requirements</h3><ul><li>Use PDF format with clear structure and readable figures.</li><li>Explain your methods and results, and cite your sources.</li><li>Check the filename and deadline before submitting.</li></ul><p><strong>Note:</strong>These fictional instructions do not represent any real course requirements.</p>`,
    }));
    byCourse[cid].push({
      id: cid * 100 + 90,
      name: "Week 01 · Course introduction",
      published: true,
      due_at: dateAt(-3),
      points: 10,
      sub: { state: 'graded', score: 10, submitted_at: dateAt(-4) },
      description: "<p>Course introduction and learning objectives. This is fictional completed-assignment data.</p>",
      url: 'https://demo.invalid/assignment',
    });
    filesBy[cid] = {
      files: [
        { id: cid * 1000 + 1, filename: `${code}_Course_Outline.pdf`, size: 524288, type: 'application/pdf', created_at: dateAt(-12) },
        { id: cid * 1000 + 2, filename: 'Lecture_02_Foundations.pdf', size: 2831155, type: 'application/pdf', created_at: dateAt(-8) },
        { id: cid * 1000 + 3, filename: 'Lecture_03_Methods.pdf', size: 4194304, type: 'application/pdf', created_at: dateAt(-3) },
        { id: cid * 1000 + 4, filename: 'Week_04_Reading_Notes.pdf', size: 1363149, type: 'application/pdf', created_at: dateAt(-1) },
      ],
      links: [{ title: "Readings and additional resources", url: 'https://demo.invalid/reading' }],
    };
    annBy[cid] = [
      {
        id: cid * 10 + 1,
        title: "This week's classes and readings",
        posted_at: dateAt(-1, 9, 0),
        url: 'https://demo.invalid/announcement',
        message: "<p>This week we will discuss core concepts and practical applications. Read Lecture 03 in advance and bring a specific question to the discussion.</p><p>Materials are available on the Course files board.</p><p><em>Fictional announcement for demonstration only.</em></p>",
      },
      {
        id: cid * 10 + 2,
        title: "Group project: start with a good question",
        posted_at: dateAt(-4, 10, 0),
        url: 'https://demo.invalid/announcement',
        message: "<p>Prepare a one-page proposal describing your research question, methods and expected outcomes before the next discussion.</p><p>This announcement is for demonstration only.</p>",
      },
    ];
    reports[cid] = {
      generatedAt: dateAt(-1, 16, 30),
      report: `## ${code} Study guide (demo)

Start with the core concepts, test your understanding through weekly exercises, then apply the methods to a clear problem.

### This week
- Read Lecture 03 and identify the key assumptions.
- Complete the current assignment and note unresolved questions.
- Prepare a one-page plan for the group project.

> A prewritten fictional example. No AI is called and this is not a real course requirement.`,
    };
  });

  const data = { courses: demoCourses, byCourse, filesBy, annBy, syncedAt: dateAt(0, 9, 41) };
  const demoMessage = "This is an interface demo. Use the desktop app to sync, use AI and download course files.";
  let messageTimer;
  function showDemoMessage(message = demoMessage) {
    const target = document.querySelector('#toast');
    if (!target) return;
    target.textContent = message;
    target.setAttribute('role', 'status');
    target.classList.remove('hidden');
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => target.classList.add('hidden'), 4500);
  }
  const unavailable = async () => { throw new Error("This action is available in the desktop app."); };
  const noOp = () => {};

  window.api = Object.freeze({
    aiPresets: async () => ({ custom: { label: "Interface demo · No AI connection" } }),
    syncProgressCurrent: async () => null,
    onSyncProgress: noOp, onAnalysisProgress: noOp, onOpenAssignment: noOp,
    onDataUpdated: noOp, onUpdateProgress: noOp,
    appVersion: async () => 'Demo',
    loadLocal: async () => {
      setTimeout(applyInitialView, 0);
      return structuredClone(data);
    },
    checkDownloaded: async files => Object.fromEntries(files.map(file => [`${file.courseCode}/${file.filename}`, false])),
    loadAnalysis: async cid => reports[cid] ? structuredClone(reports[cid]) : null,
    aiConfigLoad: async () => ({ provider: 'custom', profiles: {} }),
    aiProbe: async () => ({ ok: false }),
    telemetryConfig: async () => ({ enabled: false }),
    telemetrySetEnabled: async () => ({ enabled: false }),
    openUrl: () => showDemoMessage(),
    refresh: unavailable, downloadFile: unavailable, openFile: unavailable,
    revealFile: unavailable, aiChat: unavailable, analyzeCourse: unavailable,
    cancelAnalysis: noOp, aiConfigSave: unavailable, aiTest: unavailable,
    checkUpdate: unavailable, runUpdate: unavailable, exportTelemetry: unavailable,
  });

  // Capture before the renderer's handlers so the demo never claims that a sync,
  // download, AI call or settings save succeeded.
  const blockedControls = [
    '#refresh-btn', '#detail-open', '#detail-interpret', '#detail-plan-btn',
    '#download-all-btn', '#analysis-start', '#analysis-cancel', '#update-check-btn',
    '#update-now-btn', '#ai-settings-btn', '#ai-save-btn', '#ai-test-btn',
    '#ai-key-link', '#telemetry-toggle', '#telemetry-export-btn',
    '.file-row', '[data-att]', '.ann-actions button',
  ].join(',');
  function interceptAction(event) {
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    if (!(event.target instanceof Element)) return;
    const action = event.target.closest(blockedControls);
    const link = event.target.closest('a[href]');
    if (action || link) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showDemoMessage();
    }
  }
  document.addEventListener('click', interceptAction, true);
  document.addEventListener('keydown', interceptAction, true);

  // The website can direct this one presentation iframe through the real
  // renderer's controls. The ordinary, clickable demo does not use this API.
  function tellParent(type, step) {
    if (window.parent === window) return;
    window.parent.postMessage({ type, ...(step ? { step } : {}) }, location.origin);
  }

  function ensureStorySync() {
    let overlay = document.querySelector('#story-sync');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'story-sync';
    overlay.className = 'story-sync hidden';
    overlay.setAttribute('role', 'status');
    overlay.innerHTML = `
<div class="story-sync-card"><div class="story-sync-caption"><span class="story-sync-dot"></span> Sync demonstration</div><div class="story-sync-icon" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M20 4 5 11v12c0 8 15 14 15 14s15-6 15-14V11L20 4Z"/><path d="m13 20 5 5 10-11"/></svg></div><h2>Sign in. Settle in.</h2><p>Sign in with your school account.<br>Your courses, assignments and files arrive together.</p><div class="story-sync-login"><span class="story-sync-check" aria-hidden="true">✓</span><span>School account connected</span><span class="story-sync-state">Demo</span></div><div class="story-sync-progress"><span>Organizing course materials</span><span>5 courses</span></div><div class="story-sync-track" aria-hidden="true"><span></span></div><small>Fictional data · No sign-in required here</small></div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  function resetStoryScroll() {
    for (const element of document.querySelectorAll('main, #stage, #home-view, .board-surface, #assignment-list, #detail-desc, #ann-list, #files-list, #analysis-result')) {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    }
  }

  function applyStoryStep(step) {
    if (!storyMode || !rendererReady || !storySteps.has(step)) return;
    const revision = ++storyRevision;
    // Return via the all-courses view so changing direction produces exactly
    // the same layout, filter and detail state as visiting a scene first time.
    document.querySelector('.ann-row.expanded .ann-head')?.click();
    document.querySelector('[data-filter="pending"]')?.click();
    document.querySelector('[data-course="all"]')?.click();
    document.querySelector('#toast')?.classList.add('hidden');
    if (!['sync', 'home'].includes(step)) {
      document.querySelector('[data-course="1"]')?.click();
      document.querySelector('#stage-overview-btn')?.click();
      if (step !== 'overview') {
        document.querySelector(`[data-board="${step}"] .board-title`)?.click();
      }
      if (step === 'announcements') document.querySelector('.ann-head')?.click();
    }
    ensureStorySync().classList.toggle('hidden', step !== 'sync');
    document.documentElement.dataset.storyStep = step;
    resetStoryScroll();
    // These scenes are static; the parent owns scroll transitions. Cancelling
    // the renderer's FLIP motion also makes rapid scrolling and snapshots exact.
    document.getAnimations().forEach(animation => animation.cancel());
    Promise.resolve().then(() => Promise.resolve()).then(() => {
      if (revision !== storyRevision) return;
      resetStoryScroll();
      tellParent('canvas-story-applied', step);
    });
  }

  window.addEventListener('message', event => {
    if (!storyMode || event.source !== window.parent || event.origin !== location.origin) return;
    if (event.data?.type !== 'canvas-story' || !storySteps.has(event.data.step)) return;
    pendingStoryStep = event.data.step;
    if (rendererReady) applyStoryStep(pendingStoryStep);
  });

  function applyInitialView() {
    rendererReady = true;
    if (storyMode) {
      applyStoryStep(pendingStoryStep);
      document.documentElement.dataset.demoReady = 'true';
      tellParent('canvas-story-ready');
      return;
    }
    const course = params.get('course');
    const section = params.get('section');
    if (/^[1-5]$/.test(course || '')) {
      document.querySelector(`[data-course="${course}"]`)?.click();
      if (['assignments', 'announcements', 'files', 'analysis'].includes(section)) {
        document.querySelector(`[data-board="${section}"] .board-title`)?.click();
      }
    }
    document.documentElement.dataset.demoReady = 'true';
  }
})();
