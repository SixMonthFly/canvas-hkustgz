const L = window.SiteI18n;
const previewPaths = { home: 'demo/index.html', boards: 'demo/index.html?course=1&section=overview', files: 'demo/index.html?course=1&section=files' };
if (L.english) for (const key of Object.keys(previewPaths)) previewPaths[key] = previewPaths[key].replace('index.html', 'en.html');
let currentPreview = 'home';
let release = null;
let releaseState = 'loading';
// User-agent data is only a starting choice. Both platforms remain selectable.
let selectedPlatform = /Windows|Win32|Win64/i.test([navigator.userAgentData?.platform, navigator.platform, navigator.userAgent].filter(Boolean).join(' ')) ? 'windows' : 'mac';
const platforms = {
  mac: {
    name: 'Mac', arch: 'Apple Silicon', system: 'macOS 13+', format: L.t('DMG 安装包'), extension: '.dmg',
    compatibility: 'macOS 13+ · Apple Silicon',
    packageNote: L.t('Intel 版暂未提供'), packageDetail: L.t('DMG · 尚未公证'),
    helpId: 'first-open', helpLabel: L.t('首次打开说明 ↗'),
  },
  windows: {
    name: 'Windows', arch: 'x64', system: 'Windows 10/11', format: L.t('EXE 一键安装'), extension: '.exe',
    compatibility: 'Windows 10/11 · x64',
    packageNote: L.t('一键安装 · 当前用户'), packageDetail: L.t('EXE · 一键安装'),
    helpId: 'windows-install', helpLabel: L.t('Windows 安装说明 ↗'),
  },
};
const dialog = document.querySelector('#preview-dialog');
const largeDemo = document.querySelector('#large-demo');
const toast = document.querySelector('#toast');
let toastTimer;
function notify(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 5000);
}
document.querySelectorAll('[data-open-preview]').forEach(button => button.addEventListener('click', () => {
  largeDemo.src = previewPaths[currentPreview];
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.querySelector('#close-preview').addEventListener('click', () => { dialog.close(); syncModalScroll(); });
dialog.addEventListener('close', () => { syncModalScroll(); largeDemo.removeAttribute('src'); });
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
document.querySelectorAll('[data-expand]').forEach(link => link.addEventListener('click', () => {
  document.getElementById(link.dataset.expand).open = true;
}));
function selectedPackage() {
  if (release?.packages && typeof release.packages === 'object') {
    return release.packages[selectedPlatform] || null;
  }
  // Older cached metadata described only the Mac DMG. Never reuse it for EXE.
  return selectedPlatform === 'mac' && typeof release?.filename === 'string' && release.filename.toLowerCase().endsWith('.dmg') ? release : null;
}
function packageAvailable(pkg, platform = selectedPlatform) {
  if (pkg?.available !== true || typeof pkg.filename !== 'string' || !pkg.filename.toLowerCase().endsWith(platforms[platform].extension)) return false;
  if (typeof pkg.url !== 'string' || !pkg.url || !Number.isFinite(pkg.size) || pkg.size <= 0) return false;
  try {
    const url = new URL(pkg.url, location.href);
    return ['http:', 'https:'].includes(url.protocol) && decodeURIComponent(url.pathname.split('/').pop()) === pkg.filename;
  } catch { return false; }
}
function unavailableMessage() {
  const name = platforms[selectedPlatform].name;
  if (releaseState === 'loading') return L.html`正在读取 ${name} 安装包信息，请稍候。`;
  if (releaseState === 'error') return L.html`暂时无法读取 ${name} 安装包信息，请稍后刷新页面。`;
  return L.html`${name} 安装包尚未发布，当前暂不可下载。`;
}
function renderPlatform() {
  const platform = platforms[selectedPlatform];
  const pkg = selectedPackage();
  const available = packageAvailable(pkg);
  document.documentElement.dataset.downloadPlatform = selectedPlatform;
  document.querySelectorAll('[data-platform]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.platform === selectedPlatform)));
  document.querySelectorAll('[data-download-nav]').forEach(el => el.textContent = L.html`下载 ${platform.name} 版`);
  document.querySelectorAll('[data-download-label]').forEach(el => {
    el.textContent = available || releaseState === 'loading' ? L.html`下载 ${platform.name} 版` : L.html`${platform.name} 版暂不可下载`;
  });
  document.querySelectorAll('[data-version]').forEach(el => el.textContent = pkg?.version ? `v${pkg.version}` : releaseState === 'loading' ? L.t('读取版本中') : L.t('版本待发布'));
  for (const key of ['arch', 'system', 'format', 'compatibility']) {
    document.querySelectorAll(`[data-platform-${key}]`).forEach(el => el.textContent = platform[key]);
  }
  document.querySelectorAll('[data-download]').forEach(link => {
    link.setAttribute('aria-disabled', String(!available));
    if (available) { link.href = pkg.url; link.setAttribute('download', pkg.filename); }
    else { link.href = location.pathname + '#download'; link.removeAttribute('download'); }
  });
  document.querySelector('#package-detail').textContent = available
    ? `v${pkg.version} · ${(pkg.size / 1000 / 1000).toFixed(1)} MB · ${platform.packageDetail}`
    : unavailableMessage();
  document.querySelector('#checksum-value').textContent = available && pkg.sha256
    ? `${pkg.filename}\nSHA-256\n${pkg.sha256}`
    : L.html`${platform.name} 安装包发布后显示 SHA-256。`;
  document.querySelector('#platform-package-note').textContent = platform.packageNote;
  const helpLink = document.querySelector('#package-install-link');
  helpLink.href = location.pathname + `#${platform.helpId}`;
  helpLink.dataset.expand = platform.helpId;
  helpLink.textContent = platform.helpLabel;
}
document.querySelectorAll('[data-platform]').forEach(button => button.addEventListener('click', () => {
  if (!platforms[button.dataset.platform]) return;
  selectedPlatform = button.dataset.platform;
  renderPlatform();
}));
document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', event => {
  if (!packageAvailable(selectedPackage())) { event.preventDefault(); notify(unavailableMessage()); }
}));
async function loadRelease() {
  try {
    const response = await fetch('release.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Release unavailable');
    release = await response.json();
    if (!release || typeof release !== 'object' || Array.isArray(release)) throw new Error('Invalid release metadata');
    releaseState = 'ready';
  } catch {
    release = null;
    releaseState = 'error';
  }
  renderPlatform();
  renderDockDownloads();
}
renderPlatform();
loadRelease();

// Keyboard-accessible download menu. Each entry links directly to its own build.
const dock = document.querySelector('.site-header');
const downloadToggle = document.querySelector('#download-menu-toggle');
const downloadMenu = document.querySelector('#download-menu');
function closeDownloadMenu() {
  downloadMenu.hidden = true; downloadToggle.setAttribute('aria-expanded', 'false');
}
downloadToggle.addEventListener('click', () => {
  const opened = downloadMenu.hidden;
  downloadMenu.hidden = !opened; downloadToggle.setAttribute('aria-expanded', String(opened));
});
document.addEventListener('click', event => { if (!dock.contains(event.target)) closeDownloadMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !downloadMenu.hidden) { closeDownloadMenu(); downloadToggle.focus(); }
});
document.querySelectorAll('[data-direct-download]').forEach(link => link.addEventListener('click', event => {
  if (link.getAttribute('aria-disabled') === 'true') {
    event.preventDefault();
    selectedPlatform = link.dataset.directDownload;
    renderPlatform(); notify(unavailableMessage());
  }
  closeDownloadMenu();
}));
function renderDockDownloads() {
  document.querySelectorAll('[data-direct-download]').forEach(link => {
    const platform = link.dataset.directDownload;
    const pkg = release?.packages?.[platform];
    const available = packageAvailable(pkg, platform);
    link.href = available ? pkg.url : location.pathname + '#download';
    link.setAttribute('aria-disabled', String(!available));
    if (available) link.setAttribute('download', pkg.filename);
    else link.removeAttribute('download');
  });
}
renderDockDownloads();

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
// Scrolling only updates Dock elevation. It never drives a scene or text motion.
let motionFrame = 0;
function updateDock() {
  motionFrame = 0;
  dock.classList.toggle('is-scrolled', scrollY > 24);
}
window.addEventListener('scroll', () => {
  if (!motionFrame) motionFrame = requestAnimationFrame(updateDock);
}, { passive: true });
updateDock();

const previewCards = [...document.querySelectorAll('.motion-card,[data-motion-preview]')];
function updatePlayback() {
  for (const card of previewCards) {
    const active = card.dataset.inView === 'true' && !document.hidden && !motionPreference.matches;
    card.classList.toggle('is-playing', active);
    const button = card.querySelector('.preview-pause');
    const paused = card.classList.contains('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.disabled = motionPreference.matches;
    button.setAttribute('aria-label', L.english
      ? (motionPreference.matches ? 'Animation disabled by reduced-motion preference' : paused ? 'Play animation' : 'Pause animation')
      : (motionPreference.matches ? '已按减少动态偏好停止动画' : paused ? '播放动画' : '暂停动画'));
    button.textContent = paused ? '▷' : 'Ⅱ';
  }
}
for (const card of previewCards) {
  card.querySelector('.preview-pause').addEventListener('click', () => {
    card.classList.toggle('is-paused');
    updatePlayback();
  });
}
if ('IntersectionObserver' in window) {
  const previews = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.dataset.inView = String(entry.isIntersecting);
    updatePlayback();
  }, { threshold: .12 });
  previewCards.forEach(card => previews.observe(card));
} else {
  previewCards.forEach(card => card.dataset.inView = 'true');
}
motionPreference.addEventListener('change', updatePlayback);
document.addEventListener('visibilitychange', updatePlayback);
updatePlayback();

// Match navigation across both static language pages, with a best-effort platform preference.
try {
  const saved = localStorage.getItem('canvas-site:platform');
  if (platforms[saved]) { selectedPlatform = saved; renderPlatform(); }
} catch (_) {}
document.querySelectorAll('[data-platform]').forEach(button => button.addEventListener('click', () => {
  try { localStorage.setItem('canvas-site:platform', selectedPlatform); } catch (_) {}
}));
document.querySelector('.language-link').addEventListener('click', event => {
  const allowed = new Set(['#features','#schools','#widgets','#ai','#faq','#download']);
  if (allowed.has(location.hash)) {
    const target = new URL(event.currentTarget.href);
    target.hash = location.hash;
    event.currentTarget.href = target.href;
  }
});

// Autonomous timelines belong to their own previews, never to page scroll.
const loopCopy = L.english ? {
 'story-sync': ['Reading Canvas courses…', 'Organizing assignments…', 'Saving course files locally…', '3 demo courses synced'],
 'story-home': ['Upcoming deadlines, across courses', 'Oct 12 · Problem set 02', 'Oct 16 · Reading response', 'Oct 24 · Project proposal'],
 'story-overview': ['One course, three boards', 'Assignments and due dates', 'Latest course announcements', 'Files for your next class'],
 'story-assignments': ['Select an assignment', 'Read the requirements', 'Optional AI · break down the work', 'Start with the first step'],
 'story-announcements': ['Latest announcements first', 'New practice exercises', 'Class schedule updated', 'Project materials available'],
 'story-files': ['Download selected course files', 'Lecture 05.pdf saved', 'Reading notes.pdf saved', '3 demo files saved locally'],
 'story-analysis': ['Optional AI · reviewing materials', 'Course structure organized', 'Example grading breakdown', 'Study suggestions ready']
} : {
 'story-sync': ['正在读取 Canvas 课程…', '整理作业与公告…', '在本机保存课程资料…', '3 门示例课程已同步'],
 'story-home': ['把各门课的截止放到一起', '10 月 12 日 · Problem set 02', '10 月 16 日 · Reading response', '10 月 24 日 · Project proposal'],
 'story-overview': ['一门课程，三块看板', '查看作业与截止日期', '阅读最新课程公告', '找到下一课的资料'],
 'story-assignments': ['选择下一份作业', '看清要求和截止时间', '可选 AI · 梳理完成思路', '从第一步开始'],
 'story-announcements': ['按时间整理新消息', '本周练习已更新', '课堂安排有新消息', '项目资料已放入课件'],
 'story-files': ['下载选中的课程资料', 'Lecture 05.pdf 已保存', 'Reading notes.pdf 已保存', '3 份示例资料已保存在本机'],
 'story-analysis': ['可选 AI · 阅读课程资料', '整理课程结构', '梳理示例评分构成', '学习建议已生成']
};
const timelines = previewCards.filter(card => loopCopy[card.id] && card.querySelector('.preview-state')).map(card => ({card, elapsed:0, phase:-1}));
function paintTimeline(item, phase) {
 item.phase = phase;
 item.card.dataset.phase = String(phase);
 item.card.querySelector('.preview-state').textContent = loopCopy[item.card.id][phase];
 if (item.card.id === 'story-sync') item.card.querySelector('.sync-line span:last-child').textContent = `${Math.min(phase,3)} / 3`;
 if (item.card.id === 'story-files') item.card.querySelectorAll('.file-done').forEach((mark,i)=>mark.textContent=phase>i?'✓':'↓');
}
timelines.forEach(item=>paintTimeline(item, motionPreference.matches ? 3 : 0));
let lastTick = performance.now();
setInterval(()=>{
 const now = performance.now();const delta = Math.min(now-lastTick,250);lastTick=now;
 for(const item of timelines){
  if(motionPreference.matches){if(item.phase!==3)paintTimeline(item,3);continue;}
  if(!item.card.classList.contains('is-playing') || item.card.classList.contains('is-paused') || item.card.matches(':hover,:focus-within'))continue;
  item.elapsed=(item.elapsed+delta)%16000;
  const phase=Math.floor(item.elapsed/4000);
  if(phase!==item.phase)paintTimeline(item,phase);
 }
},200);

// The release panel owns the solid download CTA when it is in view.
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    dock.classList.toggle('at-download', entries[0].isIntersecting);
  }, { threshold: .08 }).observe(document.querySelector('#download'));
}

// A separate screenshot reader. Full frames remain unchanged; zoom affects only this dialog.
const imageDialog = document.querySelector('#image-dialog');
const imageFull = document.querySelector('#image-full');
const imageZoom = document.querySelector('#image-zoom');
function resetImageZoom() {
 imageDialog.classList.remove('is-zoomed');
 imageZoom.setAttribute('aria-pressed','false');
 imageZoom.textContent = L.english ? 'Zoom in' : '放大阅读';
 const area=imageDialog.querySelector('.image-scroll');area.scrollTop=0;area.scrollLeft=0;
}
document.querySelectorAll('[data-image-open]').forEach(button=>button.addEventListener('click',()=>{
 imageFull.src=button.dataset.imageOpen;
 imageFull.alt=button.dataset.imageTitle + (L.english ? ' — actual Mac 4.1.2 screenshot with fictional courses' : ' — Mac 4.1.2 实际截屏，虚构课程');
 document.querySelector('#image-title').textContent=button.dataset.imageTitle;
 document.querySelector('#image-original').href=button.dataset.imageOriginal;
 resetImageZoom();imageDialog.showModal();document.body.style.overflow='hidden';
}));
imageZoom.addEventListener('click',()=>{
 const zoomed=imageDialog.classList.toggle('is-zoomed');
 imageZoom.setAttribute('aria-pressed',String(zoomed));
 imageZoom.textContent= L.english ? (zoomed?'Fit image':'Zoom in') : (zoomed?'适应窗口':'放大阅读');
 if(!zoomed) resetImageZoom();
});
function syncModalScroll(){document.body.style.overflow=dialog.open||imageDialog.open?'hidden':'';}
document.querySelector('#image-close').addEventListener('click',()=>{imageDialog.close();syncModalScroll();});
imageDialog.addEventListener('close',()=>{syncModalScroll();resetImageZoom();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&imageDialog.open){event.preventDefault();imageDialog.close();syncModalScroll();}});
imageDialog.addEventListener('click',e=>{if(e.target===imageDialog){const r=imageDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)imageDialog.close();}});

// Independent, slow actual-state tour; page scroll only controls whether its clock runs.
const captureTour=document.querySelector('[data-capture-tour]');
const shotOrder=['overview','assignments','announcements','files'];
let shotElapsed=0,shotIndex=0,shotCycles=0;
const shotLabels=L.english?['Overview','Assignments','Announcements','Course files']:['总览','作业详情','公告详情','课件列表'];
function selectShot(index){
 shotIndex=index;
 captureTour.querySelectorAll('[data-shot]').forEach(frame=>{const active=frame.dataset.shot===shotOrder[index];frame.hidden=!active;frame.setAttribute('aria-hidden',String(!active));});
 captureTour.querySelectorAll('[data-capture-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.captureSelect===shotOrder[index])));
 captureTour.querySelector('.tour-status').textContent=shotLabels[index]+(L.english?' · Actual client screenshot':' · 实际客户端截屏');
}
captureTour.querySelectorAll('[data-capture-select]').forEach(b=>b.addEventListener('click',()=>{
 shotElapsed=0;shotCycles=0;selectShot(shotOrder.indexOf(b.dataset.captureSelect));
 captureTour.classList.add('is-paused');updatePlayback();
}));
captureTour.querySelector('.preview-pause').addEventListener('click',()=>{shotCycles=0;shotElapsed=0;});
let captureTick=performance.now();
setInterval(()=>{
 const now=performance.now(),delta=Math.min(now-captureTick,300);captureTick=now;
 if(motionPreference.matches||document.hidden||imageDialog.open||dialog.open||!captureTour.classList.contains('is-playing')||captureTour.classList.contains('is-paused')||captureTour.matches(':hover,:focus-within'))return;
 shotElapsed+=delta;
 if(shotElapsed>=10000){shotElapsed=0;const next=(shotIndex+1)%shotOrder.length;selectShot(next);if(next===0 && ++shotCycles>=3){captureTour.classList.add('is-paused');updatePlayback();}}
},200);
