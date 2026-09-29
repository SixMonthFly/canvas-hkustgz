/*
 * Browser-only bridge for the actual Canvas Manager renderer.
 * Every course, assignment, file and report below is synthetic demo content.
 * No Electron IPC, Canvas session, AI service, filesystem or download is used.
 */
(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const requestedTheme = params.get('theme');
  window.demoTheme = ['hkust', 'claude', 'chatgpt', 'default'].includes(requestedTheme)
    ? requestedTheme : 'hkust';
  document.body.dataset.theme = window.demoTheme;

  const now = new Date();
  const dateAt = (days, hour = 23, minute = 59) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const demoCourses = [
    { id: 1, code: 'ROAS5120 (L01)', name: '形式化验证与控制 · Formal Verification and Control' },
    { id: 2, code: 'DSAA5001 (L01)', name: '数据科学基础 · Foundations of Data Science' },
    { id: 3, code: 'PLED5001 (T01)', name: '学术英语交流 · Communicating Research in English' },
    { id: 4, code: 'AIAA5001 (L01)', name: '人工智能导论 · Introduction to Artificial Intelligence' },
    { id: 5, code: 'IOTA5002 (L01)', name: '物联网系统 · Internet of Things Systems' },
  ];
  const plans = [
    [
      ['Problem Set 02 · 状态空间', 1], ['Lab 03 · 控制器设计', 7],
      ['Project Proposal', 14], ['Problem Set 03 · 稳定性', 22],
    ],
    [
      ['作业 03 · 回归与分类', 3], ['数据探索报告', 10],
      ['小组项目 · 阶段汇报', 18], ['作业 04 · 模型评估', 27],
    ],
    [
      ['Research Abstract', 5], ['Literature Review', 12],
      ['3-minute Presentation', 20],
    ],
    [
      ['Lab 02 · 搜索算法', 4], ['Reading Notes', 11],
      ['作业 02 · 神经网络', 17], ['Project Milestone', 25],
    ],
    [
      ['传感器实验报告', 6], ['系统设计草案', 15], ['Demo Day · 项目展示', 24],
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
      description: `<h2>${name}</h2><p>这是用于展示课程管理界面的虚构作业。</p><p>请结合本周课程内容，完成问题分析、方法设计与结果讨论。在报告中清楚说明你的思路，并给出必要的实验或推导过程。</p><h3>提交要求</h3><ul><li>使用 PDF 格式，保持结构清晰、图表可读。</li><li>说明方法选择与结果，标注引用来源。</li><li>提交前核对文件名和截止时间。</li></ul><p><strong>提示：</strong>此处内容仅作界面演示，不代表学校课程安排或真实作业要求。</p>`,
    }));
    byCourse[cid].push({
      id: cid * 100 + 90,
      name: 'Week 01 · 课程导读',
      published: true,
      due_at: dateAt(-3),
      points: 10,
      sub: { state: 'graded', score: 10, submitted_at: dateAt(-4) },
      description: '<p>课程导读与学习目标梳理。此为已完成作业的演示数据。</p>',
      url: 'https://demo.invalid/assignment',
    });
    filesBy[cid] = {
      files: [
        { id: cid * 1000 + 1, filename: `${code}_Course_Outline.pdf`, size: 524288, type: 'application/pdf', created_at: dateAt(-12) },
        { id: cid * 1000 + 2, filename: 'Lecture_02_Foundations.pdf', size: 2831155, type: 'application/pdf', created_at: dateAt(-8) },
        { id: cid * 1000 + 3, filename: 'Lecture_03_Methods.pdf', size: 4194304, type: 'application/pdf', created_at: dateAt(-3) },
        { id: cid * 1000 + 4, filename: 'Week_04_Reading_Notes.pdf', size: 1363149, type: 'application/pdf', created_at: dateAt(-1) },
      ],
      links: [{ title: '课程阅读材料与补充资源', url: 'https://demo.invalid/reading' }],
    };
    annBy[cid] = [
      {
        id: cid * 10 + 1,
        title: '本周课程安排与阅读材料',
        posted_at: dateAt(-1, 9, 0),
        url: 'https://demo.invalid/announcement',
        message: '<p>本周我们将讨论核心概念与实际应用。请提前阅读 Lecture 03，并带着一个具体问题参与课堂讨论。</p><p>课程资料已整理至「课件」，可以按需查看。</p><p><em>演示公告：内容为虚构，不代表真实教学安排。</em></p>',
      },
      {
        id: cid * 10 + 2,
        title: '小组项目：从一个好问题开始',
        posted_at: dateAt(-4, 10, 0),
        url: 'https://demo.invalid/announcement',
        message: '<p>请在下次讨论前准备一页项目草案，说明研究问题、拟采用的方法与预期成果。</p><p>此公告仅用于产品界面展示。</p>',
      },
    ];
    reports[cid] = {
      generatedAt: dateAt(-1, 16, 30),
      report: `## ${code} 学习路线（演示）\n\n先理解基础概念，再通过每周练习验证理解，最后把方法应用到一个清晰的问题上。\n\n### 本周重点\n- 阅读 Lecture 03，梳理核心假设。\n- 完成当前作业，记录未解决的问题。\n- 为小组项目准备一页研究计划。\n\n> 这是预先编写的虚构示例，未调用 AI，也不代表真实课程要求。`,
    };
  });

  const data = { courses: demoCourses, byCourse, filesBy, annBy, syncedAt: dateAt(0, 9, 41) };
  const demoMessage = '这是本地界面演示。请在 Mac 应用中使用同步、AI 与课件下载功能。';
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
  const unavailable = async () => { throw new Error('界面演示不执行此操作，请在 Mac 应用中使用。'); };
  const noOp = () => {};

  window.api = Object.freeze({
    aiPresets: async () => ({ custom: { label: '界面演示 · 不连接 AI' } }),
    syncProgressCurrent: async () => null,
    onSyncProgress: noOp, onAnalysisProgress: noOp, onOpenAssignment: noOp,
    onDataUpdated: noOp, onUpdateProgress: noOp,
    appVersion: async () => '0.3.6',
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

  function applyInitialView() {
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
