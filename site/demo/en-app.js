let courses = [];        // [{id, code, name}]
let byCourse = {};       // id -> [assignment]
let filesBy = {};        // id -> {files: [], links: []}
let annBy = {};          // id -> [announcement]
let selectedCourse = 'all';
let activeSection = 'home'; // home(全部课程看板) | overview(四块看板总览) | assignments | announcements | files | analysis
const BOARDS = ['assignments', 'announcements', 'files', 'analysis'];
let expandedAnn = null;  // 当前展开的公告 id
let localFiles = {};     // "课程代码/文件名" -> 是否已下载到本地
let activeFilter = 'pending';
let currentDetail = null; // {cid, a}
let downloading = {};    // file id -> 'ing' | 'done'
let aiPresets = {};
let analysisProgress = {}; // cid -> {stage, detail, current, total, running}

const $ = (sel) => document.querySelector(sel);

// ---------- 工具 ----------

function codeOf(id) {
  const c = courses.find(c => c.id === id);
  return c ? c.code.split(' ')[0] : `Course${id}`;
}

function navLabelOf(course) {
  if (!course) return "Current course";
  const code = codeOf(course.id);
  return courses.filter(c => codeOf(c.id) === code).length > 1 ? course.code : code;
}

// 课程色:按课程在列表里的顺序分配 8 种色之一,侧边栏圆点、月历色块、首页倒计时统一用它
const COURSE_COLORS = 8;
function colorOf(cid) {
  const i = courses.findIndex(c => c.id === cid);
  return `cc${(i < 0 ? 0 : i) % COURSE_COLORS}`;
}

function parseTime(iso) {
  return iso ? new Date(iso) : null;
}

function fmtDue(iso) {
  const d = parseTime(iso);
  if (!d) return "No deadline";
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtCountdown(due) {
  const ms = due - new Date();
  if (ms <= 0) return "Due now";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days >= 1) return `Remaining ${days} d ${hours} h`;
  if (hours >= 1) return `Remaining ${hours} h ${mins} min`;
  return `${mins} min until due`;
}

function fmtSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function esc(s) {
  const d = document.createElement('span');
  d.textContent = s ?? '';
  return d.innerHTML;
}

// AI 输出按 markdown 渲染(表格/列表/加粗),失败时退回纯文本
function renderMarkdown(md) {
  if (md && window.marked) {
    try {
      return safeHtml(window.marked.parse(md));
    } catch (e) { /* fallthrough */ }
  }
  return esc(md || '');
}

function safeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/ on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/ on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '#');
}

function html2text(html) {
  const div = document.createElement('div');
  div.innerHTML = safeHtml(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h\d)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');
  return div.textContent.replace(/\n{3,}/g, '\n\n').trim();
}

// Canvas 域内的图片(插图/公式图)需要登录态,改写到主进程的 canvas-res:// 代理加载
const CANVAS_ORIGIN = 'https://hkust-gz.instructure.com';

function rewriteCanvasAssets(html) {
  const cvt = (u) => {
    const target = u.trim();
    if (!target || !/^(\/|https:\/\/hkust-gz\.instructure\.com)/.test(target)) return null;
    const abs = target.startsWith('/') ? CANVAS_ORIGIN + target : target;
    return `canvas-res://f/${encodeURIComponent(abs)}`;
  };
  return html
    // src / 懒加载的 data-src 统一改写成 src
    .replace(/\b(src|data-src)\s*=\s*"([^"]+)"/gi, (m, _attr, u) => {
      const t = cvt(u);
      return t ? `src="${t}"` : m;
    })
    .replace(/\bsrcset\s*=\s*"([^"]+)"/gi, (m, list) => {
      const parts = list.split(',').map((p) => {
        const seg = p.trim().split(/\s+/);
        const t = cvt(seg[0]);
        return t ? [t, ...seg.slice(1)].join(' ') : p.trim();
      });
      return `srcset="${parts.join(', ')}"`;
    });
}

function statusOf(a) {
  const s = a.sub;
  if (s && s.state === 'graded') return 'graded';
  if (s && (s.state === 'submitted' || s.submitted_at)) return 'submitted';
  return 'pending';
}

function classify(a) {
  if (statusOf(a) !== 'pending') return 'done';
  const due = parseTime(a.due_at);
  if (!due) return 'pending';
  return due < new Date() ? 'overdue' : 'pending';
}

const BADGE = {
  pending: ['pending', "Not submitted"],
  overdue: ['overdue', "Overdue"],
  submitted: ['submitted', "Submitted"],
  graded: ['graded', "Graded"],
};

function toast(msg, duration = 4000) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => t.classList.add('hidden'), duration);
}

let lastSyncProgressSequence = 0;
let lastSyncProgressPercent = 0;
let syncProgressHideTimer = null;

function renderSyncProgress(p) {
  if (!p || p.sequence <= lastSyncProgressSequence) return;
  if (p.runId !== renderSyncProgress.runId) lastSyncProgressPercent = 0;
  renderSyncProgress.runId = p.runId;
  lastSyncProgressSequence = p.sequence;
  clearTimeout(syncProgressHideTimer);

  const box = $('#sync-progress');
  const title = $('#sync-progress-title');
  const count = $('#sync-progress-count');
  const detail = $('#sync-progress-detail');
  const track = $('#sync-progress-track');
  const fill = $('#sync-progress-fill');
  const completed = Number(p.completed) || 0;
  const total = Number(p.total) || 0;
  const active = Array.isArray(p.active) ? p.active : [];
  const terminal = p.phase === 'done' || p.phase === 'error';

  box.classList.remove('hidden');
  $('#refresh-btn').disabled = !terminal;
  $('#refresh-btn .sync-label').textContent = terminal ? "Sync" : "Syncing…";
  count.textContent = total ? `${completed}/${total} courses` : '';
  if (p.phase === 'connecting') {
    title.textContent = "Connecting to Canvas…";
    detail.textContent = "Checking your school session";
  } else if (p.phase === 'login') {
    title.textContent = "Waiting for school sign-in";
    detail.textContent = "Complete sign-in in the opened window";
  } else if (p.phase === 'loading') {
    title.textContent = "Loading courses…";
    detail.textContent = "Signed in. Loading your courses";
  } else if (p.phase === 'courses') {
    title.textContent = active.length
      ? `Syncing ${active.slice(0, 2).join('、')}${active.length > 2 ? ` and more ${active.length} courses` : ''}`
      : completed === total ? "Course data retrieved" : "Preparing course sync…";
    detail.textContent = "Assignments, files and announcements will update together";
  } else if (p.phase === 'saving') {
    title.textContent = "Saving course data…";
    detail.textContent = "Course data retrieved. Finishing up";
  } else if (p.phase === 'done') {
    title.textContent = "Courses synced";
    detail.textContent = "Course data updated";
  } else if (p.phase === 'error') {
    title.textContent = "Course sync failed";
    detail.textContent = p.detail || "Please try again later";
  } else return;

  const percent = p.phase === 'done' ? 100
    : p.phase === 'saving' ? 95
    : p.phase === 'courses' && total ? Math.round(completed / total * 90)
    : p.phase === 'error' ? lastSyncProgressPercent : null;
  fill.classList.toggle('indeterminate', percent === null);
  if (percent === null) {
    track.removeAttribute('aria-valuenow');
    fill.style.width = '';
  } else {
    lastSyncProgressPercent = percent;
    fill.style.width = `${percent}%`;
    track.setAttribute('aria-valuenow', String(percent));
  }
  track.setAttribute('aria-valuetext', `${title.textContent}，${count.textContent}`);
  if (terminal) syncProgressHideTimer = setTimeout(() => box.classList.add('hidden'), p.phase === 'done' ? 4000 : 8000);
}

// ---------- 导航 ----------

function pendingOf(courseKey) {
  const list = courseKey === 'all'
    ? Object.values(byCourse).flat()
    : (byCourse[courseKey] || []);
  return list.filter(a => a.published && classify(a) === 'pending').length;
}

function renderNav() {
  const nav = $('#nav-items');
  const signature = JSON.stringify(courses.map(c => [c.id, c.code, c.name]));
  const entries = [['all', "All courses"], ...courses.map(c => [c.id, navLabelOf(c)])];
  if (nav.dataset.signature !== signature) {
    nav.replaceChildren();
    nav.dataset.signature = signature;
    const mk = (key, label) => {
      const div = document.createElement('div');
      div.className = 'nav-item';
      div.dataset.course = key;
      div.tabIndex = 0;
      div.setAttribute('role', 'button');
      div.innerHTML = `<span class="nav-label-text">${key === 'all' ? '' : `<i class="cdot ${colorOf(key)}" aria-hidden="true"></i>`}${esc(label)}</span><span class="count"></span>`;
      const activate = () => {
        if (selectedCourse === key) return;
        closeDetail({ immediate: true, restoreFocus: false });
        selectedCourse = key;
        render();
      };
      div.onclick = activate;
      div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } };
      nav.appendChild(div);
    };
    for (const [key, label] of entries) mk(key, label);
  }
  entries.forEach(([key, label], index) => {
    const div = nav.children[index];
    const n = pendingOf(key);
    div.classList.toggle('active', selectedCourse === key);
    div.setAttribute('aria-pressed', String(selectedCourse === key));
    const count = div.querySelector('.count');
    count.textContent = n;
    count.classList.toggle('zero', n === 0);
    div.title = key === 'all' ? "All courses · Counts include upcoming assignments and those without a deadline" :
      `${courses.find(c => c.id === key)?.name || label} · ${n} to do`;
  });
}

// ---------- 作业列表 ----------

function visibleAssignments() {
  let items = [];
  if (selectedCourse === 'all') {
    for (const [cid, list] of Object.entries(byCourse)) {
      for (const a of list) items.push({ cid: +cid, a });
    }
  } else {
    (byCourse[selectedCourse] || []).forEach(a => items.push({ cid: selectedCourse, a }));
  }
  items = items.filter(({ a }) => a.published);
  if (activeFilter !== 'all') items = items.filter(({ a }) => classify(a) === activeFilter);
  items.sort((x, y) => (x.a.due_at || '9999') < (y.a.due_at || '9999') ? -1 : 1);
  return items;
}

function renderList() {
  const box = $('#assignment-list');
  const items = visibleAssignments();
  box.innerHTML = '';
  if (!items.length) {
    const labels = { pending: "No upcoming assignments", overdue: "No overdue assignments", done: "No completed assignments", all: "No assignments yet" };
    box.innerHTML = `<div class="empty"><strong>${labels[activeFilter]}</strong><p>Current view：${esc(selectedCourse === 'all' ? "All courses" : navLabelOf(courses.find(c => c.id === selectedCourse)))}</p>` +
      (activeFilter !== 'all' ? "<button class=\"empty-show-all\">View all assignments</button>" : "<p>Select Sync to update Canvas data。</p>") + '</div>';
    box.querySelector('.empty-show-all')?.addEventListener('click', () => $('#sub-filters [data-filter="all"]').click());
    return;
  }
  const showCourse = selectedCourse === 'all';
  for (const { cid, a } of items) {
    const cls = classify(a);
    const [bc, bt] = BADGE[statusOf(a) === 'pending' && cls === 'overdue' ? 'overdue' : statusOf(a)];
    const due = parseTime(a.due_at);
    let dueHtml = esc(fmtDue(a.due_at));
    if (cls === 'pending' && due) dueHtml += `<span class="cd" style="color:var(--warn)">${esc(fmtCountdown(due))}</span>`;
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.assignment = `${cid}:${a.id}`;
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `${a.name}, ${fmtDue(a.due_at)}, ${bt}`);
    row.title = `${a.name} · ${codeOf(cid)} · ${fmtDue(a.due_at)}`;
    row.innerHTML =
      `<span class="due">${dueHtml}</span>` +
      `<span class="badge ${bc}">${bt}</span>` +
      `<span class="name">${showCourse ? `<span class="course-tag">${esc(codeOf(cid))}</span>` : ''}${esc(a.name)}</span>` +
      `<span class="points">${a.points != null ? a.points + "min" : ''}</span>`;
    const activate = () => openDetail(cid, a);
    row.onclick = activate;
    row.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } };
    box.appendChild(row);
  }
  updateAssignmentSelection();
}

function updateAssignmentSelection() {
  const key = currentDetail ? `${currentDetail.cid}:${currentDetail.a.id}` : null;
  document.querySelectorAll('#assignment-list .row').forEach(row => {
    const selected = row.dataset.assignment === key;
    row.classList.toggle('selected', selected);
    row.setAttribute('aria-expanded', String(selected));
    row.setAttribute('aria-controls', 'detail-panel');
  });
}

// ---------- 详情面板 + AI 解读 ----------

let detailMotion = null;
let detailMotionVersion = 0;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function openDetail(cid, a) {
  if (currentDetail?.cid === cid && currentDetail.a.id === a.id) return;
  currentDetail = { cid, a };
  $('#detail-title').textContent = a.name;
  const s = a.sub;
  let statusText = { pending: "Not submitted", submitted: "Submitted", graded: "Graded" }[statusOf(a)];
  if (statusOf(a) === 'graded' && s) statusText += ` ${s.score}/${a.points ?? '?'}`;
  const due = parseTime(a.due_at);
  $('#detail-meta').textContent = `${codeOf(cid)} · Due ${fmtDue(a.due_at)}` +
    (due && due > new Date() && statusOf(a) === 'pending' ? `(${fmtCountdown(due)})` : '') + ` · ${statusText}`;
  const atts = a.attachments || [];
  const attHtml = atts.length
    ? "<div class=\"att-block\"><div class=\"att-title\">📎 Attachments</div>" +
      atts.map((x, i) =>
        `<div class="att-row"><span class="fname">${esc(x.filename)}</span>` +
        `<span class="meta">${fmtSize(x.size)}</span><button data-att="${i}">⬇ Download</button></div>`).join('') +
      '</div>'
    : '';
  $('#detail-desc').innerHTML = attHtml +
    (a.description
      ? `<div class="paper">${rewriteCanvasAssets(safeHtml(a.description))}</div>`
      : "<i class=\"note-muted\">(No description provided for this assignment)</i>");
  hideInterpretation();
  hidePlan();
  const panel = $('#detail-panel');
  const opening = panel.classList.contains('hidden') || panel.dataset.state === 'closing';
  ++detailMotionVersion;
  detailMotion?.cancel();
  panel.inert = false;
  panel.dataset.state = 'open';
  panel.classList.remove('hidden');
  $('#detail-desc').scrollTop = 0;
  if (opening && !reducedMotion()) {
    detailMotion = panel.animate([
      { opacity: .5, transform: 'translateX(18px)' },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
  }
  // 响应式下详情面板是覆盖层,点遮罩可关闭
  panel.onclick = (e) => { if (e.target === panel) closeDetail(); };
  updateAssignmentSelection();
}

function closeDetail({ immediate = false, restoreFocus = true } = {}) {
  const key = currentDetail ? `${currentDetail.cid}:${currentDetail.a.id}` : null;
  currentDetail = null;
  const panel = $('#detail-panel');
  const hadFocus = panel.contains(document.activeElement);
  const version = ++detailMotionVersion;
  detailMotion?.cancel();
  panel.inert = true;
  panel.dataset.state = 'closing';
  panel.onclick = null;
  updateAssignmentSelection();
  const finish = () => {
    if (version !== detailMotionVersion) return;
    panel.classList.add('hidden');
    panel.dataset.state = 'closed';
  };
  if (restoreFocus && hadFocus && key) {
    [...document.querySelectorAll('#assignment-list .row')]
      .find(row => row.dataset.assignment === key)?.focus({ preventScroll: true });
  }
  if (immediate || panel.classList.contains('hidden') || reducedMotion()) {
    finish();
  } else {
    detailMotion = panel.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(12px)' },
    ], { duration: 120, easing: 'ease-in', fill: 'forwards' });
    detailMotion.finished.then(finish, () => {});
  }
}

// 作业附件下载:成功落到 data/files/课程代码/,失败则退回浏览器打开 Canvas 直链
async function downloadAttachment(btn, att) {
  if (!att || !currentDetail) return;
  const { cid } = currentDetail;
  btn.disabled = true;
  btn.textContent = "Downloading…";
  try {
    await window.api.downloadFile({ courseId: cid, fileId: att.id, courseCode: codeOf(cid), filename: att.filename });
    btn.textContent = "✓ Downloaded";
    toast(`Downloaded:${att.filename}`);
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "⬇ Download";
    toast(`Download restricted,Try opening in your browser:${e.message}`);
    if (att.url) window.api.openUrl(att.url);
  }
}

function hideInterpretation() {
  const box = $('#detail-interpretation');
  box.classList.add('hidden');
  box.textContent = '';
  const btn = $('#detail-interpret');
  btn.disabled = false;
  btn.textContent = "✨ AI Explain";
}

function hidePlan() {
  const box = $('#detail-plan');
  box.classList.add('hidden');
  box.innerHTML = '';
  const btn = $('#detail-plan-btn');
  btn.disabled = false;
  btn.textContent = "📋 Plan assignment";
}

async function interpretCurrent() {
  if (!currentDetail) return;
  const btn = $('#detail-interpret');
  const { a } = currentDetail;
  const text = html2text(a.description || '');
  if (!text) { toast("No description for this assignment,Nothing to explain"); return; }
  btn.disabled = true;
  btn.textContent = "Explaining…";
  try {
    const out = await window.api.aiChat({
      system: "You are a teaching assistant,Help the student understand the assignment. Respond in English,Follow this structure,Do not add other sections:\n【Task] Describe this assignment in one or two sentences\n【To do] List the required tasks\n【Notes] Deadline/length and formatting/submission method/grading criteria(Include only information provided,if missing, say\"Not specified in the instructions\")",
      user: `Assignment:${a.name}
Due:${a.due_at || "None"}
Points:${a.points ?? '?'}

Instructions:
${text.slice(0, 10000)}`,
    });
    const box = $('#detail-interpretation');
    box.innerHTML = renderMarkdown(out);
    box.classList.remove('hidden');
    btn.textContent = "Explain again";
  } catch (e) {
    toast("Explanation failed:" + e.message);
    btn.textContent = "✨ AI Explain";
  } finally {
    btn.disabled = false;
  }
}

// ---------- 生成作业方案 ----------

async function generatePlan() {
  if (!currentDetail) return;
  const btn = $('#detail-plan-btn');
  const { cid, a } = currentDetail;
  const text = html2text(a.description || '');
  const due = parseTime(a.due_at);
  const left = due && due > new Date() ? fmtCountdown(due) : "No deadline or overdue";
  btn.disabled = true;
  btn.textContent = "Planning…";
  const box = $('#detail-plan');
  box.classList.remove('hidden');
  box.innerHTML = "<i class=\"note-muted\">AI Creating your plan(This may take a few moments)…</i>";
  try {
    let ctx = '';
    try {
      const saved = await window.api.loadAnalysis(cid);
      if (saved && saved.report) ctx = "\n\n【Course context(Excerpt from the previous course guide)】\n" + saved.report.slice(0, 3000);
    } catch (e) { /* 无分析报告也不影响 */ }
    const out = await window.api.aiChat({
      system: [
        "You are an experienced teaching assistant,Help the student create an actionable plan based on the assignment instructions;Do not invent missing requirements,You may give general suggestions, labeled\"Confirm with your instructor\"。Respond in English markdown,Use these section headings:",
        "【🎯 Goal] Required output and skills assessed,one or two sentences",
        "【📋 Steps] Break down the work in order,one step per line,include estimated time",
        "【⏱ Schedule] Plan the remaining time before the deadline(what to do today and each following day)",
        "【✅ Checklist] Format, names, attachments and length",
        "【⚠️ Risks] Common reasons for losing points,and when to ask your instructor early/teaching assistant",
      ].join('\n'),
      user: `Course:${codeOf(cid)}
Assignment:${a.name}
Due:${a.due_at || "None"}(Time remaining ${left})
Points:${a.points ?? '?'}

Instructions:
${(text || "(No assignment description,Infer the likely task from the title,and first remind the student to confirm the exact requirements)").slice(0, 12000)}${ctx}`,
    });
    box.innerHTML = renderMarkdown(out);
    btn.textContent = "Generate again";
  } catch (e) {
    box.innerHTML = `<i class="note-bad">Generation failed:${esc(e.message)}</i>`;
    btn.textContent = "📋 Plan assignment";
  } finally {
    btn.disabled = false;
  }
}

// ---------- 导学报告(结构化渲染:格式固定,与模型/课程无关) ----------

function renderGuide(s) {
  const RISK = { '低': ['low', "😀 Low"], '中': ['mid', "⚠️ Medium"], '高': ['high', "❗ High"] };
  const [riskCls, riskTxt] = RISK[s.risk && s.risk.level] || RISK["Medium"];
  const rows = (s.gradingRows || []).map(r =>
    `<tr><td>${esc(r.name)}</td><td>${esc(r.points)}</td><td>${esc(r.weight)}</td><td>${esc(r.due)}</td></tr>`).join('');
  const dates = (s.dates || []).map(d => `<li><span>${esc(d.item)}</span><span class="g-due">${esc(d.due)}</span></li>`).join('')
    || "<li><span>No assignments due in the next two weeks</span></li>";
  const res = (s.resources || []).map(r => `<li><span>${esc(r.name)}</span><span class="g-due">${esc(r.when)}</span></li>`).join('')
    || "<li><span>No specific recommendations</span></li>";
  const tips = (s.tips || []).map(t => `<li>${esc(t)}</li>`).join('');
  return `<div class="guide-report">
    <h1 class="g-title">【${esc(s.code || '')} Course guide】</h1>
    <div class="g-risk ${riskCls}">Academic risk:${riskTxt}</div>
    <table class="g-table">
      <thead><tr><th>Name</th><th>Points</th><th>Weight</th><th>Deadline</th></tr></thead>
      <tbody>${rows || "<tr><td colspan=\"4\">No grading breakdown found in the materials,Confirm with your instructor</td></tr>"}</tbody>
    </table>
    ${s.gradingNote ? `<p class="g-note">${esc(s.gradingNote)}</p>` : ''}
    <h2 class="g-h2">【How to pass this course】</h2>
    <p class="g-oneliner">${esc(s.oneLiner || '')}</p>
    <details class="g-details">
      <summary>Show detailed guide</summary>
      <div class="g-guide-body">
        <h3 class="g-h3">【Risks and actions】</h3>
        <p>${esc((s.risk && s.risk.reason) || '')}</p>
        <h3 class="g-h3">【Key dates】</h3>
        <ul class="g-list">${dates}</ul>
        <h3 class="g-h3">【Resources】</h3>
        <ul class="g-list">${res}</ul>
        <h3 class="g-h3">【Study suggestions】</h3>
        <ul class="g-list">${tips || "<li>None</li>"}</ul>
      </div>
    </details>
  </div>`;
}

// ---------- 全部课程看板 ----------
// 只做两件事:提示下一项截止;把未来 30 天的截止铺成按周对齐的月历,作业按课程着色

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function bigCountdown(due) {
  const ms = due - new Date();
  const pad = n => String(n).padStart(2, '0');
  if (ms <= 0) return "Due now";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days >= 1) return `${days} d ${pad(hours)} h`;
  if (hours >= 1) return `${pad(hours)}:${pad(mins)}`;
  return `${mins} min`;
}

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "Burning the midnight oil?";
  if (h < 11) return "Good morning";
  if (h < 13) return "Good afternoon";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// 带单位的倒计时,避免 "19:59" 被误读成钟点
function longCountdown(due) {
  const ms = due - new Date();
  if (ms <= 0) return "Due now";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days >= 1) return `${days} d ${hours} h`;
  if (hours >= 1) return `${hours} h ${mins} min`;
  return `${mins} min`;
}

const CAL_DAYS = 30;

function renderHome() {
  const box = $('#home-view');
  const now = new Date();
  const today = startOfDay(now);
  const pad = n => String(n).padStart(2, '0');
  const md = d => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dayMs = 86400000;
  const dayIndex = d => Math.round((startOfDay(d) - today) / dayMs);

  // 下一项:未提交且截止在未来的最早一项
  const upcoming = [];
  for (const [cidStr, list] of Object.entries(byCourse)) {
    for (const a of list) {
      if (!a.published || classify(a) !== 'pending') continue;
      const d = parseTime(a.due_at);
      if (d && d > now) upcoming.push({ cid: +cidStr, a });
    }
  }
  upcoming.sort((x, y) => (x.a.due_at < y.a.due_at ? -1 : 1));
  const next = upcoming[0];

  const hero = next
    ? `<div class="hn" data-cid="${next.cid}" data-aid="${next.a.id}">
        <div class="hn-label">Next deadline</div>
        <div class="hn-count">${esc(bigCountdown(parseTime(next.a.due_at)))}</div>
        <div class="hn-count-long only-claude">In <b>${esc(longCountdown(parseTime(next.a.due_at)))}</b></div>
        <div class="hn-title">${esc(next.a.name)}<span class="hn-course ${colorOf(next.cid)}">${esc(codeOf(next.cid))}</span>` +
        `<span class="hn-due">${esc(fmtDue(next.a.due_at))} Due</span></div>
      </div>`
    : `<div class="hn hn-clear">
        <div class="hn-label">Next deadline</div>
        <div class="hn-count">${courses.length ? "No upcoming deadlines" : "Your courses start here"}</div>
        <div class="hn-title">${courses.length ? "Nothing coming up. Find overdue assignments and those without a deadline on each course's Assignments board.。" : "Select Sync and sign in to see your courses here."}</div>
      </div>`;

  // 月历:从本周一开始按周对齐,行数刚好盖住今天起的 30 天
  const lead = (today.getDay() + 6) % 7;               // 今天是本周第几天(周一 = 0)
  const rows = Math.ceil((lead + CAL_DAYS) / 7);
  const start = new Date(today);
  start.setDate(start.getDate() - lead);
  const end = new Date(today);
  end.setDate(end.getDate() + CAL_DAYS - 1);

  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d, offset: i - lead, items: [] };
  });
  let inRange = 0;
  for (const [cidStr, list] of Object.entries(byCourse)) {
    for (const a of list) {
      if (!a.published) continue;
      const d = parseTime(a.due_at);
      if (!d) continue;
      const off = dayIndex(d);
      if (off < -lead || off >= CAL_DAYS) continue;
      cells[off + lead].items.push({ cid: +cidStr, a, d });
      if (off >= 0) inRange++;
    }
  }

  const MAX_ITEMS = rows > 5 ? 2 : 3;
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", ""];
  const grid = cells.map(({ date, offset, items }, i) => {
    items.sort((x, y) => x.d - y.d);
    const cls = ['cal-day'];
    if (offset < 0) cls.push('past');
    if (offset === 0) cls.push('today');
    if (offset >= CAL_DAYS) cls.push('out');
    if (i % 7 >= 5) cls.push('weekend');
    const monthStart = date.getDate() === 1 || i === 0;
    const label = offset === 0 ? `<b>Today</b> ${date.getDate()}`
      : monthStart ? `${date.getMonth() + 1}/${date.getDate()}` : String(date.getDate());
    const shown = items.length > MAX_ITEMS ? items.slice(0, MAX_ITEMS - 1) : items;
    const its = shown.map(({ cid, a, d }) => {
      const st = classify(a);
      const state = st === 'done' ? ' done' : st === 'overdue' ? ' late' : '';
      const tip = `${codeOf(cid)}  ${a.name}\n${md(d)} ${pad(d.getHours())}:${pad(d.getMinutes())} Due` +
        (st === 'done' ? "(Completed)" : st === 'overdue' ? "(Overdue)" : '');
      return `<div class="cal-item ${colorOf(cid)}${state}" data-cid="${cid}" data-aid="${a.id}" title="${esc(tip)}">${esc(a.name)}</div>`;
    }).join('');
    const more = items.length > shown.length
      ? `<div class="cal-more" title="${esc(items.slice(shown.length).map(x => `${codeOf(x.cid)}  ${x.a.name}`).join('\n'))}">In ${items.length - shown.length} items</div>` : '';
    return `<div class="${cls.join(' ')}"><div class="cal-date">${label}</div>${its}${more}</div>`;
  }).join('');

  box.innerHTML =
    `<h2 class="hn-greet only-claude">${greeting()}</h2>` +
    hero +
    `<div class="cal">` +
      `<div class="cal-head"><h2 class="cal-title">Next 30 days</h2>` +
      `<span class="cal-range">${md(today)} to ${md(end)}</span>` +
      `<span class="sec-count">${inRange ? `${inRange} due` : "No deadlines"}</span></div>` +
      `<div class="cal-grid" style="--rows:${rows}">` +
        weekday.map((w, i) => `<div class="cal-wd${i >= 5 ? ' weekend' : ''}">${w}</div>`).join('') +
        grid +
      `</div>` +
    `</div>`;

  box.querySelectorAll('[data-aid]').forEach(el => {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    const activate = () => {
      const cid = +el.dataset.cid;
      const a = (byCourse[cid] || []).find(x => x.id === +el.dataset.aid);
      if (a) gotoAssignment(cid, a);
    };
    el.onclick = activate;
    el.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } };
  });
}

// ---------- 看板舞台(台前调度) ----------
// 切换看板时只改 #stage 的 data-mode 和 .is-focus,节点不重建;
// 位置变化用 FLIP 补一段 200ms 的过渡:先记下旧位置,改布局后从旧位置滑到新位置。
function flipBoards(mutate) {
  const boards = [...document.querySelectorAll('#stage .board')];
  const before = new Map(boards.map(b => [b, b.getBoundingClientRect()]));
  mutate();
  if (reducedMotion()) return;
  for (const b of boards) {
    const from = before.get(b);
    const to = b.getBoundingClientRect();
    if (!from.width || !to.width) continue;
    const dx = from.left - to.left, dy = from.top - to.top;
    const sx = from.width / to.width, sy = from.height / to.height;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < .01 && Math.abs(sy - 1) < .01) continue;
    b.getAnimations().forEach(an => an.cancel());
    b.animate([
      { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      { transformOrigin: '0 0', transform: 'none' },
    ], { duration: 200, easing: 'cubic-bezier(.2, .8, .2, 1)' });
  }
}

// sec: overview | assignments | announcements | files | analysis(全部课程下只有 home)
function selectSection(sec) {
  if (selectedCourse === 'all') sec = 'home';
  else if (sec === 'home') sec = 'overview';
  if (activeSection === sec) return;
  flipBoards(() => { activeSection = sec; layoutStage(); });
}

// 让某项作业在列表里可见:当前筛选不包含它时切到它所属的筛选
function revealInFilter(a) {
  const cls = classify(a);
  if (activeFilter === 'all' || activeFilter === cls) return;
  activeFilter = cls;
  document.querySelectorAll('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === cls);
    c.setAttribute('aria-pressed', String(c.dataset.filter === cls));
  });
}

function gotoAssignment(cid, a) {
  if (selectedCourse !== cid) closeDetail({ immediate: true, restoreFocus: false });
  selectedCourse = cid;
  revealInFilter(a);
  if (activeSection === 'assignments') render();
  else { activeSection = 'assignments'; render(); }
  openDetail(cid, a);
  document.querySelector(`#assignment-list .row[data-assignment="${cid}:${a.id}"]`)?.scrollIntoView({ block: 'nearest' });
}


// ---------- 公告视图 ----------

function visibleAnnouncements() {
  const cids = selectedCourse === 'all' ? courses.map(c => c.id) : [selectedCourse];
  const items = [];
  for (const cid of cids) {
    for (const ann of annBy[cid] || []) items.push({ cid, ann });
  }
  items.sort((x, y) => (x.ann.posted_at || '') < (y.ann.posted_at || '') ? 1 : -1);
  return items;
}

function renderAnnouncements() {
  const showCourse = selectedCourse === 'all';
  const items = visibleAnnouncements();
  const list = $('#ann-list');
  list.innerHTML = '';
  if (!items.length) {
    list.innerHTML = selectedCourse === 'all'
      ? "<div class=\"empty\">No announcements yet,Select Sync to load</div>"
      : `<div class="empty">${esc(codeOf(selectedCourse))} No announcements for this course(Select All courses to see everything」)</div>`;
    return;
  }
  const now = new Date();
  for (const { cid, ann } of items) {
    const posted = parseTime(ann.posted_at);
    const isNew = posted && (now - posted) < 7 * 86400000;
    const row = document.createElement('div');
    row.className = 'ann-row';
    const pad = n => String(n).padStart(2, '0');
    const dateText = posted
      ? `${posted.getFullYear()}-${pad(posted.getMonth() + 1)}-${pad(posted.getDate())}`
      : "Unknown date";
    row.innerHTML =
      `<button class="ann-head" type="button" aria-expanded="false" aria-controls="ann-${cid}-${ann.id}">` +
      `<span class="due">${dateText}</span>` +
      (isNew ? "<span class=\"badge pending\">New</span>" : '') +
      `<span class="name">${showCourse ? `<span class="course-tag">${esc(codeOf(cid))}</span>` : ''}${esc(ann.title)}</span>` +
      `<span class="ann-chevron" aria-hidden="true">›</span></button>`;
    const head = row.querySelector('.ann-head');
    head.setAttribute('aria-label', `${ann.title}, ${dateText}`);
    const content = document.createElement('div');
    content.className = 'ann-content';
    content.id = `ann-${cid}-${ann.id}`;
    const inner = document.createElement('div');
    inner.className = 'ann-content-inner';
    content.appendChild(inner);
    row.appendChild(content);
    const ensureContent = () => {
      if (inner.childElementCount) return;
      const body = document.createElement('div');
      body.className = 'ann-body';
      body.innerHTML = ann.message
        ? `<div class="paper">${rewriteCanvasAssets(safeHtml(ann.message))}</div>`
        : "<i class=\"note-muted\">(No announcement text)</i>";
      const actions = document.createElement('div');
      actions.className = 'ann-actions';
      const openBtn = document.createElement('button');
      openBtn.textContent = "🌐 Original";
      openBtn.onclick = (e) => { e.stopPropagation(); window.api.openUrl(ann.url); };
      const aiBtn = document.createElement('button');
      aiBtn.className = 'primary';
      aiBtn.textContent = "✨ AI Summarize";
      aiBtn.onclick = (e) => { e.stopPropagation(); summarizeAnnouncement(cid, ann, body); };
      actions.append(openBtn, aiBtn);
      inner.append(body, actions);
    };
    row.setExpanded = (open) => {
      if (open) ensureContent();
      // 读取初始折叠高度，首次展开也能从 0 平滑过渡。
      if (row.isConnected) content.getBoundingClientRect();
      row.classList.toggle('expanded', open);
      head.setAttribute('aria-expanded', String(open));
      content.setAttribute('aria-hidden', String(!open));
      content.inert = !open;
    };
    head.onclick = () => {
      const open = !row.classList.contains('expanded');
      for (const other of list.querySelectorAll('.ann-row.expanded')) {
        if (other !== row) other.setExpanded(false);
      }
      expandedAnn = open ? ann.id : null;
      row.setExpanded(open);
    };
    row.setExpanded(expandedAnn === ann.id);
    list.appendChild(row);
  }
}

async function summarizeAnnouncement(cid, ann, bodyEl) {
  const text = html2text(ann.message || '');
  if (!text) { toast("No announcement text,Nothing to summarize"); return; }
  const box = document.createElement('div');
  box.className = 'detail-translation ann-summary';
  box.textContent = "AI Summarizing…";
  bodyEl.after(box);
  try {
    const out = await window.api.aiChat({
      system: "You are a teaching assistant. Respond in English 3 bullet points at most to summarize this announcement:Include required actions, deadlines and important details. Output only the bullets。",
      user: `Course:${codeOf(cid)}
Announcement:${ann.title}
Published:${ann.posted_at || '?'}

Content:
${text.slice(0, 8000)}`,
    });
    box.innerHTML = renderMarkdown(out);
  } catch (e) {
    box.textContent = "Summary failed:" + e.message;
  }
}

// ---------- 课件视图 ----------

function visibleFiles() {
  const cids = selectedCourse === 'all' ? courses.map(c => c.id) : [selectedCourse];
  const files = [], links = [];
  for (const cid of cids) {
    const d = filesBy[cid];
    if (!d) continue;
    for (const f of d.files || []) files.push({ cid, f });
    for (const l of d.links || []) links.push({ cid, l });
  }
  files.sort((x, y) => (x.f.created_at || '') < (y.f.created_at || '') ? 1 : -1);
  links.sort((a, b) => a.cid - b.cid);
  return { files, links };
}

let localFilesRequest = 0;
let localFilesChecking = false;

async function refreshLocalFiles() {
  const request = ++localFilesRequest;
  const course = selectedCourse;
  const { files } = visibleFiles();
  localFilesChecking = true;
  renderFiles();
  let found = {};
  try {
    if (files.length) found = await window.api.checkDownloaded(
      files.map(({ cid, f }) => ({ courseCode: codeOf(cid), filename: f.filename })));
  } catch (e) { /* 保留已有的下载状态，稍后可重试 */ }
  if (request !== localFilesRequest || course !== selectedCourse) return;
  localFiles = { ...localFiles, ...found };
  localFilesChecking = false;
  renderFiles();
}

function renderFiles() {
  const showCourse = selectedCourse === 'all';
  const { files, links } = visibleFiles();
  const list = $('#files-list');
  const scrollTop = list.scrollTop;
  list.innerHTML = '';
  $('#files-hint').textContent = `${files.length} files · Save to data/files/`;
  if (!files.length && !links.length) {
    list.innerHTML = "<div class=\"empty\">No course files yet,Select Sync to load</div>";
    return;
  }
  if (files.length) {
    const h = document.createElement('div');
    h.className = 'file-sec-title';
    h.textContent = "📄 Files(PPT/PDF and more,Select a file to download,Downloaded files can be opened)";
    list.appendChild(h);
  }
  for (const { cid, f } of files) {
    const key = `${codeOf(cid)}/${f.filename}`;
    const has = localFiles[key];
    const checking = localFilesChecking && !(key in localFiles);
    const st = downloading[f.id];
    const row = document.createElement('div');
    row.className = 'file-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `${f.filename}, ${fmtSize(f.size)}, ${has ? "Downloaded" : "Not downloaded"}`);
    let actions;
    if (checking) actions = "<button disabled>Checking…</button>";
    else if (st === 'ing') actions = "<button disabled>Downloading…</button>";
    else if (has) actions = "<button data-act=\"open\">📂 Open</button><button data-act=\"reveal\">📁 Show in folder</button>";
    else actions = "<button>⬇ Download</button>";
    row.innerHTML =
      `<span class="fname">${showCourse ? `<span class="course-tag">${esc(codeOf(cid))}</span>` : ''}${esc(f.filename)}</span>` +
      `<span class="meta">${esc((f.type || '').split('/').pop())}</span>` +
      `<span class="meta">${fmtSize(f.size)}</span>` +
      `<span class="file-actions">${actions}</span>`;
    const activate = () => { if (!checking && !localFiles[key] && downloading[f.id] !== 'ing') downloadOne(cid, f); };
    row.onclick = activate;
    row.onkeydown = (e) => { if (e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(); } };
    row.querySelectorAll('button').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const arg = { courseCode: codeOf(cid), filename: f.filename };
        if (btn.dataset.act === 'open') {
          try { await window.api.openFile(arg); } catch (err) { toast("Could not open:" + err.message); }
        } else if (btn.dataset.act === 'reveal') {
          try { await window.api.revealFile(arg); } catch (err) { toast(err.message); }
        } else if (!downloading[f.id]) {
          downloadOne(cid, f);
        }
      };
    });
    list.appendChild(row);
  }
  if (links.length) {
    const h = document.createElement('div');
    h.className = 'file-sec-title';
    h.textContent = "🔗 Links shared by your instructor / Pages(Click to open)";
    list.appendChild(h);
  }
  for (const { cid, l } of links) {
    const row = document.createElement('div');
    row.className = 'file-row link-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'link');
    row.setAttribute('aria-label', l.title || l.url);
    row.innerHTML =
      `<span class="fname">${showCourse ? `<span class="course-tag">${esc(codeOf(cid))}</span>` : ''}${esc(l.title || l.url)}</span>` +
      `<span class="meta">Links</span><span class="meta"></span><button>↗ Open</button>`;
    const activate = () => window.api.openUrl(l.url);
    row.onclick = activate;
    row.onkeydown = (e) => { if (e.target === row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activate(); } };
    list.appendChild(row);
  }
  list.scrollTop = scrollTop;
}

async function downloadOne(cid, f) {
  downloading[f.id] = 'ing';
  renderFiles();
  try {
    await window.api.downloadFile({ courseId: cid, fileId: f.id, courseCode: codeOf(cid), filename: f.filename });
    downloading[f.id] = 'done';
    localFiles[`${codeOf(cid)}/${f.filename}`] = true;
    toast(`Downloaded:${f.filename}`);
  } catch (e) {
    delete downloading[f.id];
    toast(`Download failed:${f.filename} - ${e.message}`);
  }
  renderFiles();
}

async function downloadAll() {
  const btn = $('#download-all-btn');
  const { files } = visibleFiles();
  if (!files.length) { toast("No files to download"); return; }
  btn.disabled = true;
  let ok = 0;
  for (let i = 0; i < files.length; i++) {
    btn.textContent = `⬇ Downloading ${i + 1}/${files.length}`;
    const { cid, f } = files[i];
    if (downloading[f.id] !== 'done') {
      downloading[f.id] = 'ing';
      renderFiles();
      try {
        await window.api.downloadFile({ courseId: cid, fileId: f.id, courseCode: codeOf(cid), filename: f.filename });
        downloading[f.id] = 'done';
        localFiles[`${codeOf(cid)}/${f.filename}`] = true;
        ok++;
      } catch (e) {
        delete downloading[f.id];
        toast(`Download failed:${f.filename} - ${e.message}`);
      }
      renderFiles();
    }
  }
  btn.disabled = false;
  btn.textContent = "⬇ Download all";
  toast(`All downloads complete:Succeeded ${ok}/${files.length}`);
}

// ---------- 课程结构分析 ----------

const STAGE_LABEL = {
  web: "① 🌐 Fetching course materials", select: "② 🧠 AI Selecting materials", download: "③ ⬇ Downloading files",
  extract: "④ 📝 Extracting text", ai: "⑤ 🤖 AI Summarizing files", final: "⑥ 📊 Writing report",
  done: "✔ Done", error: "✖ Failed",
};

let analysisRenderRequest = 0;

async function renderAnalysis() {
  const request = ++analysisRenderRequest;
  if (selectedCourse === 'all') {
    $('#analysis-course-name').textContent = '';
    $('#analysis-cost-hint').textContent = "Select a course in the sidebar";
    $('#analysis-start').classList.add('hidden');
    $('#analysis-cancel').classList.add('hidden');
    $('#analysis-progress').classList.add('hidden');
    $('#analysis-result').innerHTML = '';
    return;
  }
  const cid = selectedCourse;
  const p = analysisProgress[cid];
  const running = !!(p && p.running);
  const startBtn = $('#analysis-start');
  startBtn.classList.remove('hidden');
  startBtn.disabled = running;
  startBtn.textContent = running ? "Analyzing…" : "▶ Analyze course";
  $('#analysis-cancel').classList.toggle('hidden', !running);
  const course = courses.find(c => c.id === cid);
  $('#analysis-course-name').textContent = course ? course.name : codeOf(cid);

  const docs = ((filesBy[cid] || {}).files || []).filter(f => /\.(pdf|pptx|docx)$/i.test(f.filename));
  $('#analysis-cost-hint').textContent = running ? '' : `Start manually · Estimated ${docs.length} files + Assignments/syllabus data,Uses your API quota`;

  const progBox = $('#analysis-progress');
  if (p) {
    progBox.classList.remove('hidden');
    const total = p.total || 1;
    const pct = Math.max(0, Math.min(100, Math.round(((p.current || 0) / total) * 100)));
    progBox.innerHTML =
      `<div class="prog-line">${STAGE_LABEL[p.stage] || esc(p.stage)}${p.total ? ` ${Math.min(p.current || 0, p.total)}/${p.total}` : ''}</div>` +
      `<div class="prog-detail">${esc(p.detail || '')}</div>` +
      (p.stage === 'done' || p.stage === 'error' ? '' : `<div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>`);
  } else {
    progBox.classList.add('hidden');
  }

  const resultBox = $('#analysis-result');
  if (resultBox.dataset.course !== String(cid)) {
    resultBox.dataset.course = cid;
    resultBox.innerHTML = "<div class=\"empty\" role=\"status\">Loading course guide…</div>";
  }
  const saved = await window.api.loadAnalysis(cid);
  if (request !== analysisRenderRequest || cid !== selectedCourse) return;
  if (saved) {
    const t = new Date(saved.generatedAt);
    const pad = n => String(n).padStart(2, '0');
    const meta = `<div class="analysis-meta">Last analyzed:${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}(Select Analyze course to regenerate)</div>`;
    resultBox.innerHTML = meta +
      (saved.structured ? renderGuide(saved.structured) : `<div class="analysis-report">${renderMarkdown(saved.report)}</div>`);
    $('#board-meta-analysis').textContent = running ? "Analyzing" : `${pad(t.getMonth() + 1)}-${pad(t.getDate())} Generated`;
  } else {
    resultBox.innerHTML = running ? '' : "<div class=\"empty\"><strong>No course guide yet</strong><p>Select Analyze course」，AI to review files and syllabus for grading, key dates and study suggestions。</p></div>";
    $('#board-meta-analysis').textContent = running ? "Analyzing" : "Not analyzed";
  }
}

async function startAnalysis() {
  if (selectedCourse === 'all') return;
  const cid = selectedCourse;
  analysisProgress[cid] = { stage: 'web', detail: "Preparing…", running: true, current: 0, total: 1 };
  renderAnalysis();
  try {
    await window.api.analyzeCourse(cid);
  } catch (e) {
    analysisProgress[cid] = { stage: 'error', detail: e.message, running: false };
    renderAnalysis();
    toast("Analysis failed:" + e.message);
    return;
  }
  analysisProgress[cid] = { ...(analysisProgress[cid] || {}), running: false };
  renderAnalysis();
}

// ---------- 设置 ----------

function providerKey() { return $('#ai-provider').value; }

let settingsProfiles = {};       // provider -> {baseUrl, model, apiKey},各服务商独立保存
let currentProfileKey = null;    // 表单当前显示的是哪个服务商的档案

// 把表单里当前的内容暂存到它所属服务商的档案。
// 注意不能用下拉框当前值做 key:change 触发时下拉框已经是新服务商,而表单里还是旧服务商的内容
function stashCurrentProfile() {
  const key = currentProfileKey || providerKey();
  settingsProfiles[key] = {
    baseUrl: $('#ai-baseurl').value.trim(),
    model: $('#ai-model').value.trim(),
    apiKey: $('#ai-key').value.trim(),
  };
}

function applyProviderUI(key) {
  const p = aiPresets[key] || {};
  const prof = settingsProfiles[key] || {};
  // 预设服务商:接口地址和模型都自动带,用户只填 Key
  $('#ai-baseurl-row').classList.toggle('hidden', key !== 'custom');
  $('#ai-baseurl').value = prof.baseUrl || p.baseUrl || '';
  $('#ai-model').value = key === 'custom' ? (prof.model || '') : (p.model || '');
  $('#ai-model').readOnly = key !== 'custom';
  $('#ai-model').placeholder = key === 'custom' ? "Model name(OpenAI compatible)" : "This preset supports only this model,Fixed";
  $('#ai-key').value = prof.apiKey || '';
  const link = $('#ai-key-link');
  if (p.keyUrl) {
    link.classList.remove('hidden');
    link.textContent = `↗ Go to ${p.label} console to get / purchase API Key`;
  } else {
    link.classList.add('hidden');
  }
  currentProfileKey = key;
}

async function openSettings() {
  const sel = $('#ai-provider');
  sel.innerHTML = '';
  for (const [k, p] of Object.entries(aiPresets)) {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = p.label;
    sel.appendChild(o);
  }
  const raw = await window.api.aiConfigLoad();
  aiCfgRaw = raw || {};
  settingsProfiles = (raw && raw.profiles) || {};
  const cur = raw && raw.provider && aiPresets[raw.provider] ? raw.provider : 'glm';
  sel.value = cur;
  applyProviderUI(cur);
  $('#theme-select').value = document.body.dataset.theme || 'default';
  refreshAiStatus();
  const tel = await window.api.telemetryConfig().catch(() => ({ enabled: true }));
  $('#telemetry-toggle').checked = tel.enabled !== false;
  const modal = $('#settings-modal');
  modal.classList.remove('hidden');
  // 弹窗焦点陷阱:聚焦第一个输入框,Tab 循环不出去
  const firstInput = modal.querySelector('input, select, button');
  if (firstInput) firstInput.focus();
  modal.onclick = (e) => { if (e.target === modal) modal.classList.add('hidden'); };
}

// ---------- 应用内更新(入口常驻左下角) ----------
let pendingUpdate = null; // {latest, notes, assets, url}

function hideUpdatePanels() {
  $('#update-progress-box').classList.add('hidden');
  $('#update-new-box').classList.add('hidden');
  $('#update-panel').classList.add('hidden');
}

async function checkUpdate(silent = false) {
  const btn = $('#update-check-btn');
  btn.disabled = true;
  btn.textContent = "Checking…";
  hideUpdatePanels();
  try {
    const info = await window.api.checkUpdate();
    $('#update-status').textContent = `📦 v${info.latest}${info.isNewer ? ' 🔴' : ''}`;
    $('#update-status').classList.toggle('has-update', !!info.isNewer);
    btn.textContent = "🚀 Check for updates";
    if (!info.isNewer) {
      if (!silent) toast(`You are up to date(${info.current})`);
      return;
    }
    pendingUpdate = info;
    const notes = $('#update-notes');
    notes.innerHTML = window.marked
      ? safeHtml(window.marked.parse(info.notes))
      : esc(info.notes);
    $('#update-new-box').classList.remove('hidden');
    $('#update-panel').classList.remove('hidden');
  } catch (e) {
    toast("Could not check for updates:" + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "🚀 Check for updates";
  }
}

async function runUpdateNow() {
  if (!pendingUpdate) return;
  $('#update-new-box').classList.add('hidden');
  $('#update-panel').classList.remove('hidden');
  $('#update-progress-box').classList.remove('hidden');
  $('#update-stage').textContent = "Preparing download…";
  $('#update-fill').style.width = '0%';
  try {
    await window.api.runUpdate(pendingUpdate.assets);
  } catch (e) {
    $('#update-stage').textContent = "Update failed";
    $('#update-detail').textContent = e.message;
    $('#update-fill').style.width = '0%';
    toast("Update failed:" + e.message, 8000);
  }
}

// 测试连接用:当前表单的生效配置(思考档位取顶栏滑块)
function collectCfg() {
  return {
    provider: providerKey(),
    baseUrl: $('#ai-baseurl').value.trim(),
    model: $('#ai-model').value.trim(),
    apiKey: $('#ai-key').value.trim(),
    effort: currentEffort(),
  };
}

// ---------- 设置内:AI 状态 + 思考档位三选(快速/均衡/深度) ----------

const DEFAULT_LEVELS = ['disabled', 'low', 'high', 'max']; // 探测失败时的兜底档位
let thinkingLevels = DEFAULT_LEVELS.slice();
let aiCfgRaw = null;      // ai_config.json 原始内容

function effectiveEffort(raw) {
  return (raw && raw.effort) || ((raw && raw.thinkingMode) === 'fast' ? 'disabled' : 'high');
}

function currentEffort() {
  const i = thinkingLevels.indexOf(effectiveEffort(aiCfgRaw));
  return i >= 0 ? thinkingLevels[i] : thinkingLevels[thinkingLevels.length - 1];
}

// 档位归为三档:快速=关思考 / 均衡=低中档 / 深度=高档
function effortClass(level) {
  if (level === 'disabled') return 'fast';
  if (['minimal', 'low', 'medium'].includes(level)) return 'balanced';
  return 'deep';
}

function classToLevel(cls) {
  if (cls === 'fast') return thinkingLevels.includes('disabled') ? 'disabled' : null;
  const pool = cls === 'balanced' ? ['medium', 'low', 'minimal'] : ['max', 'high'];
  return pool.find(l => thinkingLevels.includes(l)) || null;
}

function refreshAiStatus() {
  const raw = aiCfgRaw || {};
  const provider = raw.provider && aiPresets[raw.provider] ? raw.provider : 'custom';
  const preset = aiPresets[provider] || {};
  const prof = (raw.profiles && raw.profiles[provider]) || {};
  const model = provider === 'custom' ? (prof.model || "Model not set") : (preset.model || prof.model || '?');
  const hasKey = !!(prof.apiKey || '');

  $('#ai-status-model').textContent = hasKey ? `🤖 Current model:${model}` : "🎁 Preview quota enabled(No need to enter Key to use AI Feature)";

  const seg = $('#effort-seg');
  seg.classList.toggle('hidden', !hasKey || provider === 'custom');
  if (hasKey && provider !== 'custom') {
    if (Array.isArray(raw.thinkingLevels) && raw.thinkingLevels.length) thinkingLevels = raw.thinkingLevels;
    const cur = effortClass(effectiveEffort(raw));
    seg.querySelectorAll('button').forEach(btn => {
      const cls = btn.dataset.effort;
      btn.classList.toggle('active', cls === cur);
      btn.disabled = !classToLevel(cls); // 模型不支持的档位(如不可关思考)置灰
    });
  }
}

async function loadAiRaw() {
  aiCfgRaw = await window.api.aiConfigLoad();
  refreshAiStatus();
}

async function saveEffort(level) {
  const raw = aiCfgRaw || {};
  raw.effort = level;
  await window.api.aiConfigSave(raw);
}

// 探测当前模型支持的思考档位(读 /models 元数据,主进程持久化结果)
async function probeEfforts(cfg) {
  try {
    const p = await window.api.aiProbe(cfg || null);
    if (p && p.ok && Array.isArray(p.levels) && p.levels.length) {
      thinkingLevels = p.levels;
      aiCfgRaw = await window.api.aiConfigLoad(); // 主进程已把 levels 落盘,重新读
      refreshAiStatus();
      return true;
    }
  } catch (e) { /* 探测失败用兜底档位 */ }
  return false;
}

async function testAi() {
  const btn = $('#ai-test-btn');
  btn.disabled = true;
  btn.textContent = "Testing…";
  try {
    const cfg = collectCfg();
    const r = await window.api.aiTest(cfg);
    toast("Connected,Model response:" + r.slice(0, 40));
    probeEfforts(cfg); // 顺手探测该模型支持的思考档位
  } catch (e) {
    toast("Test failed:" + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Test connection";
  }
}

// ---------- 主题皮肤 ----------

function applyTheme(theme) {
  const ok = ['default', 'chatgpt', 'claude', 'hkust'].includes(theme);
  document.body.dataset.theme = ok ? theme : 'default';
  $('#theme-select').value = document.body.dataset.theme;
  arrangeChrome(document.body.dataset.theme);
  syncOptionEmoji(document.body.dataset.theme === 'claude');
  try { localStorage.setItem('canvas-demo-theme', document.body.dataset.theme); } catch (e) { /* 忽略 */ }
}

// Claude 皮肤没有顶栏:标题/同步放进侧边栏顶部,设置放到左下角;切回其它皮肤时按原顺序放回顶栏。
// 移动的是同一批节点,事件绑定不受影响。
function arrangeChrome(theme) {
  const title = $('#app-title'), synced = $('#synced-at');
  const settings = $('#ai-settings-btn'), refresh = $('#refresh-btn'), progress = $('#sync-progress');
  if (theme === 'claude') {
    $('#nav-brand').append(title);
    $('#nav-sync').append(refresh, synced, progress);
    $('#update-footer').append(settings);
  } else {
    $('header').append(title, synced, settings, refresh);
    $('header').after(progress);
  }
}

// ---------- emoji 标记 ----------
// 界面文案里的 emoji 统一包成 <span class="emo">,由皮肤决定显示与否(Claude 皮肤隐藏)。
// 用 MutationObserver 兜住所有动态写入的文案;Canvas 原文(.paper)和输入控件不动。
const EMOJI_RE = /\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*\s*/gu;
const EMOJI_SKIP = '.paper, .emo, script, style, textarea, option, input';

function wrapEmojiIn(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    const text = node.nodeValue;
    if (!parent || parent.closest(EMOJI_SKIP) || !text) return;
    EMOJI_RE.lastIndex = 0;
    if (!EMOJI_RE.test(text)) return;
    EMOJI_RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (const m of text.matchAll(EMOJI_RE)) {
      if (m.index > last) frag.append(text.slice(last, m.index));
      const span = document.createElement('span');
      span.className = 'emo';
      span.textContent = m[0];
      frag.append(span);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.replaceWith(frag);
  } else if (node.nodeType === Node.ELEMENT_NODE && !node.matches(EMOJI_SKIP)) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(wrapEmojiIn);
  }
}

function watchEmoji() {
  // The browser demo can be removed while its iframe is changing documents.
  const body = document.body;
  if (!body || !body.isConnected) return;
  wrapEmojiIn(body);
  const observer = new MutationObserver((muts) => {
    if (!body.isConnected || document.body !== body) {
      observer.disconnect();
      return;
    }
    for (const m of muts) {
      if (m.type === 'characterData') wrapEmojiIn(m.target);
      else m.addedNodes.forEach(wrapEmojiIn);
    }
  });
  observer.observe(body, { childList: true, subtree: true, characterData: true });
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}

// <option> 里不能放 span,只能直接改文字:Claude 皮肤下去掉 emoji,其它皮肤还原
function syncOptionEmoji(hide) {
  document.querySelectorAll('option').forEach((o) => {
    if (o.dataset.raw == null) o.dataset.raw = o.textContent;
    o.textContent = hide ? o.dataset.raw.replace(EMOJI_RE, '') : o.dataset.raw;
  });
}

// ---------- 渲染入口 ----------

function renderBoardMeta() {
  if (selectedCourse === 'all') return;
  const list = (byCourse[selectedCourse] || []).filter(a => a.published);
  const pending = list.filter(a => classify(a) === 'pending').length;
  const overdue = list.filter(a => classify(a) === 'overdue').length;
  $('#board-meta-assignments').textContent =
    [pending ? `${pending} to do` : "Nothing to do", overdue ? `${overdue} overdue` : ''].filter(Boolean).join('，');
  const anns = annBy[selectedCourse] || [];
  const fresh = anns.filter(x => parseTime(x.posted_at) > Date.now() - 7 * 86400000).length;
  $('#board-meta-announcements').textContent = anns.length ? `${anns.length} items${fresh ? `，${fresh} new` : ''}` : "None";
  const fl = filesBy[selectedCourse] || {};
  const nFiles = (fl.files || []).length, nLinks = (fl.links || []).length;
  $('#board-meta-files').textContent = nFiles || nLinks
    ? [nFiles ? `${nFiles} files` : '', nLinks ? `${nLinks} links` : ''].filter(Boolean).join('，') : "None";
}

// 只摆放看板(模式、台前是哪块、可交互性),不重画内容;切看板时只调这个,列表节点和滚动位置保持不动
function layoutStage() {
  const isAll = selectedCourse === 'all';
  // 全部课程只有一块固定看板;具体课程在"总览"和"某块看板在台前"之间切换
  if (isAll) activeSection = 'home';
  else if (activeSection === 'home') activeSection = 'overview';
  const focus = BOARDS.includes(activeSection) ? activeSection : null;
  const stage = $('#stage');
  stage.dataset.mode = isAll ? 'home' : focus ? 'focus' : 'overview';
  $('#home-view').classList.toggle('hidden', !isAll);
  document.querySelectorAll('#stage .board').forEach(board => {
    const name = board.dataset.board;
    const onStage = name === focus;
    board.classList.toggle('is-focus', onStage);
    // 不在台前的看板只是预览:内容不可交互,整块可点
    board.querySelector('.board-surface').inert = !onStage;
    const title = board.querySelector('.board-title');
    title.setAttribute('aria-expanded', String(onStage));
    title.tabIndex = focus ? (onStage ? 0 : -1) : 0;
  });
  if (focus !== 'assignments' && !$('#detail-panel').classList.contains('hidden')) {
    closeDetail({ immediate: true, restoreFocus: false });
  }
}

function render() {
  renderNav();
  layoutStage();
  if (selectedCourse === 'all') {
    renderHome();
    return;
  }
  renderBoardMeta();
  renderList();
  renderAnnouncements();
  refreshLocalFiles();
  renderAnalysis();
}

async function init() {
  watchEmoji();
  aiPresets = await window.api.aiPresets();

  window.api.onSyncProgress(renderSyncProgress);
  window.api.syncProgressCurrent().then(p => {
    // 重开窗口只恢复进行中的任务，不重放早已完成的提示让页面上下跳动。
    if (p && p.phase !== 'done' && p.phase !== 'error') renderSyncProgress(p);
  }).catch(() => {});

  let savedTheme = window.demoTheme || 'default';
  try { savedTheme = window.demoTheme || localStorage.getItem('canvas-demo-theme') || 'default'; } catch (e) { /* 忽略 */ }
  applyTheme(savedTheme);
  $('#theme-select').onchange = () => applyTheme($('#theme-select').value);

  window.api.onAnalysisProgress((p) => {
    const prev = analysisProgress[p.courseId] || {};
    analysisProgress[p.courseId] = {
      ...prev,
      stage: p.stage,
      detail: p.detail,
      current: p.current,
      total: p.total,
      running: p.stage !== 'done' && p.stage !== 'error',
    };
    if (selectedCourse === p.courseId) renderAnalysis();
  });

  // 看板:总览/缩略状态下整块可点;标题按钮可用方向键在看板间切换
  document.querySelectorAll('#stage .board').forEach(board => {
    const name = board.dataset.board;
    board.addEventListener('click', () => {
      if (!board.classList.contains('is-focus')) selectSection(name);
    });
  });
  document.querySelectorAll('.board-title').forEach(title => {
    title.onkeydown = (e) => {
      const titles = [...document.querySelectorAll('#stage .board-title')];
      const index = titles.indexOf(title);
      let next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = titles[(index + 1) % titles.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = titles[(index - 1 + titles.length) % titles.length];
      else if (e.key === 'Home') next = titles[0];
      else if (e.key === 'End') next = titles.at(-1);
      if (next) {
        e.preventDefault();
        if (activeSection !== 'overview') selectSection(next.dataset.section);
        next.focus({ preventScroll: true });
      }
    };
  });
  $('#stage-overview-btn').onclick = () => selectSection('overview');
  document.querySelectorAll('.chip').forEach(chip => {
    chip.setAttribute('role', 'button');
    chip.setAttribute('aria-pressed', chip.classList.contains('active') ? 'true' : 'false');
    const activate = () => {
      if (activeFilter === chip.dataset.filter) return;
      closeDetail({ immediate: true, restoreFocus: false });
      document.querySelector('.chip.active').classList.remove('active');
      chip.classList.add('active');
      document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
      activeFilter = chip.dataset.filter;
      renderList();
    };
    chip.onclick = activate;
    chip.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } };
  });

  $('#refresh-btn').onclick = async () => {
    const btn = $('#refresh-btn');
    const label = btn.querySelector('.sync-label');
    btn.disabled = true;
    label.textContent = "Syncing…";
    const startedAt = Date.now();
    toast("Syncing Canvas…Complete sign-in if a login window appears;Sync continues in the background,Please wait");
    try {
      const data = await window.api.refresh();
      ({ courses, byCourse, filesBy, annBy } = normalize(data));
      renderSyncedAt(data.syncedAt);
      render();
      toast(`Sync complete · in ${((Date.now() - startedAt) / 1000).toFixed(1)} s`);
    } catch (e) {
      toast("Sync failed:" + e.message, 8000);
    } finally {
      btn.disabled = false;
      label.textContent = "Sync";
    }
  };

  $('#detail-close').onclick = closeDetail;
  $('#detail-open').onclick = () => currentDetail && currentDetail.a.url && window.api.openUrl(currentDetail.a.url);
  $('#detail-interpret').onclick = interpretCurrent;
  $('#detail-plan-btn').onclick = generatePlan;

  // 点击通知跳转到对应作业;自动同步后刷新界面
  window.api.onOpenAssignment(({ cid, a }) => gotoAssignment(cid, a));
  window.api.onDataUpdated((data) => {
    ({ courses, byCourse, filesBy, annBy } = normalize(data));
    renderSyncedAt(data.syncedAt);
    render();
    toast("Canvas data updated automatically");
  });

  $('#download-all-btn').onclick = downloadAll;
  $('#analysis-start').onclick = startAnalysis;
  $('#analysis-cancel').onclick = () => {
    if (selectedCourse !== 'all') window.api.cancelAnalysis(selectedCourse);
    toast("Cancellation requested,Please wait…");
  };
  $('#ai-settings-btn').onclick = openSettings;
  window.appVersion = await window.api.appVersion();
  $('#update-status').textContent = `📦 Demo`;
  $('#update-check-btn').onclick = () => checkUpdate(false);
  $('#update-now-btn').onclick = runUpdateNow;
  $('#update-later-btn').onclick = hideUpdatePanels;
  $('#update-panel-close').onclick = hideUpdatePanels;
  $('#telemetry-toggle').onchange = async (e) => {
    const r = await window.api.telemetrySetEnabled(e.target.checked).catch(() => null);
    if (r) toast(r.enabled ? "Local diagnostics enabled" : "Local diagnostics disabled");
  };
  $('#telemetry-export-btn').onclick = async () => {
    try {
      const out = await window.api.exportTelemetry();
      toast("Exported and opened folder:" + out.split(/[\\/]/).pop());
    } catch (e) {
      toast("Export failed:" + e.message);
    }
  };
  window.api.onUpdateProgress((p) => {
    $('#update-panel').classList.remove('hidden');
    const box = $('#update-progress-box');
    box.classList.remove('hidden');
    $('#update-stage').textContent = p.stage === 'download' ? "⬇ Download update" : p.stage === 'verify' ? "🔒 Verify integrity" : p.stage === 'done' ? "✅ Starting installer" : p.stage;
    $('#update-detail').textContent = p.detail || '';
    $('#update-fill').style.width = (p.pct || 0) + '%';
  });
  $('#ai-provider').onchange = () => { stashCurrentProfile(); applyProviderUI(providerKey()); };
  $('#ai-key-link').onclick = () => {
    const p = aiPresets[providerKey()];
    if (p && p.keyUrl) window.api.openUrl(p.keyUrl);
  };
  $('#ai-cancel-btn').onclick = () => {
    const modal = $('#settings-modal');
    modal.classList.add('hidden');
    modal.onclick = null;
  };
  $('#ai-save-btn').onclick = async () => {
    stashCurrentProfile();
    aiCfgRaw = {
      ...(aiCfgRaw || {}),
      provider: providerKey(),
      effort: currentEffort(),
      profiles: settingsProfiles,
    };
    await window.api.aiConfigSave(aiCfgRaw);
    const modal = $('#settings-modal');
    modal.classList.add('hidden');
    modal.onclick = null;
    refreshAiStatus();
    toast("Settings saved");
  };
  $('#ai-test-btn').onclick = testAi;

  // 思考档位三选:点击即保存并刷新高亮
  document.querySelectorAll('#effort-seg button').forEach(btn => {
    btn.onclick = async () => {
      const level = classToLevel(btn.dataset.effort);
      if (!level) return;
      await saveEffort(level);
      refreshAiStatus();
    };
  });

  // 键盘:Esc 关闭弹窗与详情面板
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = $('#settings-modal');
      const panel = $('#detail-panel');
      if (!modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        e.preventDefault();
      } else if (!panel.classList.contains('hidden')) {
        closeDetail();
        e.preventDefault();
      } else if (BOARDS.includes(activeSection) && !e.target.closest?.('input, select, textarea')) {
        const from = activeSection;
        selectSection('overview');
        document.querySelector(`.board-title[data-section="${from}"]`)?.focus({ preventScroll: true });
        e.preventDefault();
      }
    }
  });

  $('#detail-desc').addEventListener('click', (e) => {
    const attBtn = e.target.closest('button[data-att]');
    if (attBtn && currentDetail) {
      downloadAttachment(attBtn, (currentDetail.a.attachments || [])[+attBtn.dataset.att]);
      return;
    }
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') !== '#') {
      e.preventDefault();
      if (/^https?:\/\//.test(a.href)) window.api.openUrl(a.href);
    }
  });

  $('#ann-list').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && a.getAttribute('href') !== '#') {
      e.preventDefault();
      if (/^https?:\/\//.test(a.href)) window.api.openUrl(a.href);
    }
  });

  const data = await window.api.loadLocal();
  ({ courses, byCourse, filesBy, annBy } = normalize(data));
  renderSyncedAt(data.syncedAt);
  render();
  if (!courses.length) toast("No local data yet,Select Sync to sign in to Canvas and load your courses");

  // 顶栏模型状态 + 思考档位探测(不阻塞首屏)
  loadAiRaw().then(() => probeEfforts());
}

function normalize(data) {
  return {
    courses: data.courses || [],
    byCourse: data.byCourse || {},
    filesBy: data.filesBy || {},
    annBy: data.annBy || {},
  };
}

function renderSyncedAt(iso) {
  const el = $('#synced-at');
  if (!iso) { el.textContent = ''; return; }
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  el.textContent = `Synced ${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

init();
