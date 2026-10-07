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
    compatibility: 'macOS 13+ · Apple Silicon', eyebrow: L.t('开始使用 Mac 版'),
    installCompatibility: L.t('适用于 macOS 13 及以上的 Apple Silicon Mac。\n安装后，使用学校账号登录 Canvas。'),
    packageNote: L.t('Intel 版暂未提供'), packageDetail: L.t('DMG · 尚未公证'),
    noticeTitle: L.t('首次打开前，请留意'),
    noticeCopy: L.t('当前版本尚未经过 Apple 公证，macOS 可能拦截首次启动。请先阅读下方说明，再决定是否安装。'),
    helpId: 'first-open', helpLabel: L.t('首次打开说明 ↗'),
    steps: [
      [L.t('下载 Mac 版'), L.t('获取适用于 M 系列芯片的\nDMG 安装包。'), '↓'],
      [L.t('打开安装包'), L.t('双击下载的 DMG，\n打开安装窗口。'), '◫'],
      [L.t('拖入 Applications'), L.t('将应用拖到「应用程序」，\n等待复制完成。'), '<span>C</span><b>→</b><span>A</span>'],
      [L.t('开启新学期'), L.t('打开应用，点击「同步」，\n完成学校账号登录。'), '↗'],
    ],
  },
  windows: {
    name: 'Windows', arch: 'x64', system: 'Windows 10/11', format: L.t('EXE 一键安装'), extension: '.exe',
    compatibility: 'Windows 10/11 · x64', eyebrow: L.t('开始使用 Windows 版'),
    installCompatibility: L.t('适用于 Windows 10/11 x64 电脑。\n一键安装后，使用学校账号登录 Canvas。'),
    packageNote: L.t('一键安装 · 当前用户'), packageDetail: L.t('EXE · 一键安装'),
    noticeTitle: L.t('双击安装，准备就绪'),
    noticeCopy: L.t('下载的是完整 EXE 安装包。双击后为当前用户一键安装，完成后自动启动；之后也可从桌面或开始菜单打开。'),
    helpId: 'windows-install', helpLabel: L.t('Windows 安装说明 ↗'),
    steps: [
      [L.t('下载 Windows 版'), L.t('获取完整 EXE 安装包，\n适用于 Windows x64。'), '↓'],
      [L.t('双击，一键安装'), L.t('双击下载的 EXE，\n为当前用户完成安装。'), '◫'],
      [L.t('安装后自动启动'), L.t('也可从桌面或开始菜单的\n快捷方式打开应用。'), '↗'],
      [L.t('同步学校课程'), L.t('点击应用内的「同步」，\n完成学校账号登录。'), '✓'],
    ],
  },
};
const heroDemo = document.querySelector('#hero-demo');
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
function fitDemo() {
  const width = document.querySelector('.demo-viewport').clientWidth;
  heroDemo.style.setProperty('--demo-scale', String(width / 1180));
}
new ResizeObserver(fitDemo).observe(document.querySelector('.demo-viewport'));
fitDemo();
document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
  currentPreview = button.dataset.preview;
  heroDemo.src = previewPaths[currentPreview];
  document.querySelectorAll('[data-preview]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
}));
document.querySelectorAll('[data-open-preview]').forEach(button => button.addEventListener('click', () => {
  largeDemo.src = previewPaths[currentPreview];
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.querySelector('#close-preview').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = ''; largeDemo.removeAttribute('src'); });
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
document.querySelectorAll('[data-expand]').forEach(link => link.addEventListener('click', () => {
  document.getElementById(link.dataset.expand).open = true;
}));
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
}
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
  document.querySelector('[data-install-eyebrow]').textContent = platform.eyebrow;
  document.querySelector('#install-compatibility').textContent = platform.installCompatibility;
  document.querySelector('#install-notice-title').textContent = platform.noticeTitle;
  document.querySelector('#install-notice-copy').textContent = platform.noticeCopy;
  for (const id of ['install-notice-link', 'package-install-link']) {
    const link = document.getElementById(id);
    link.href = location.pathname + `#${platform.helpId}`;
    link.dataset.expand = platform.helpId;
  }
  document.querySelector('#package-install-link').textContent = platform.helpLabel;
  platform.steps.forEach(([title, description, symbol], index) => {
    document.querySelector(`[data-install-title="${index}"]`).textContent = title;
    document.querySelector(`[data-install-description="${index}"]`).textContent = description;
    const icon = document.querySelector(`[data-install-symbol="${index}"]`);
    // Symbols are fixed presentation strings above, never release metadata.
    icon.innerHTML = symbol;
    icon.classList.toggle('drag-symbol', selectedPlatform === 'mac' && index === 2);
  });
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

// One ordinary page scroll drives the entire tour. No wheel interception,
// automatic scrolling or click is required to advance a scene.
const storyFrame = document.querySelector('#story-demo');
const storyViewport = document.querySelector('.story-viewport');
const storyChapters = [...document.querySelectorAll('[data-story]')];
const aiChapters = [...document.querySelectorAll('[data-ai-step]')];
const aiPicture = document.querySelector('.ai-picture');
const storyCaption = document.querySelector('#story-caption');
const storyLayout = document.querySelector('.story-layout');
const storyStage = document.querySelector('.story-stage');
const storyLabel = document.createElement('span');
storyLabel.className = 'story-caption-label';
storyCaption.before(storyLabel);
storyLayout.style.setProperty('--story-scenes', storyChapters.length);
document.querySelector('.story-chapters').setAttribute('aria-hidden', 'true');
let activeStory = -1;
let activeAI = -1;
let scrollQueued = false;
let displayedStory = null;
let sentStory = null;
let fadeTimer;
let revealTimer;
let sceneRevision = 0;
const reducedStoryMotion = matchMedia('(prefers-reduced-motion: reduce)');
function updateStoryCaption() {
  const chapter = storyChapters[activeStory];
  storyCaption.textContent = chapter.querySelector('h3').textContent;
  storyLabel.textContent = `${String(activeStory + 1).padStart(2, '0')} / ${String(storyChapters.length).padStart(2, '0')} · ${chapter.querySelector('.chapter-label').textContent}`;
}
function sendStory(animate = true) {
  if (activeStory < 0) return;
  const step = storyChapters[activeStory].dataset.story;
  if (animate && step === displayedStory && !storyFrame.classList.contains('is-switching')) return;
  const revision = ++sceneRevision;
  clearTimeout(fadeTimer);
  clearTimeout(revealTimer);
  const postStep = () => {
    if (revision !== sceneRevision) return;
    sentStory = step;
    storyFrame.contentWindow.postMessage({ type: 'canvas-story', step }, location.origin);
    // Keep the page readable even if an iframe acknowledgement is delayed.
    revealTimer = setTimeout(() => {
      if (revision === sceneRevision) { updateStoryCaption(); storyFrame.classList.remove('is-switching'); }
    }, 1200);
  };
  if (!animate || displayedStory === null || reducedStoryMotion.matches) {
    storyFrame.classList.remove('is-switching');
    postStep();
  } else {
    // Change the renderer only after the old scene has gently faded away.
    // Rapid scroll updates cancel the pending change and use the newest scene.
    storyFrame.classList.add('is-switching');
    fadeTimer = setTimeout(postStep, 180);
  }
}
function fitStory() {
  const figure = document.querySelector('.ai-figure');
  figure.style.maxWidth = innerWidth > 800 ? `${Math.max(360, (innerHeight - 130) * 1200 / 850)}px` : '';
  const demoWidth = innerWidth <= 800 ? 720 : 1180;
  const scale = storyViewport.clientWidth / demoWidth;
  storyFrame.style.width = `${demoWidth}px`;
  storyFrame.style.setProperty('--demo-scale', String(scale));
  // Let the demo use the viewport's actual aspect ratio without cropping it.
  storyFrame.style.height = `${storyViewport.clientHeight / scale}px`;
  figure.style.setProperty('--stage-top', `${Math.max(22, (innerHeight - figure.offsetHeight) / 2)}px`);
}
function visibleChapter(chapters) {
  const marker = innerHeight * (innerWidth <= 800 ? .78 : .52);
  let selected = 0;
  let nearest = Infinity;
  for (let i = 0; i < chapters.length; i++) {
    const copy = chapters[i].querySelector('.chapter-copy') || chapters[i].firstElementChild;
    const rect = copy.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - marker);
    if (distance < nearest) { selected = i; nearest = distance; }
  }
  return selected;
}
function updateTour() {
  scrollQueued = false;
  const travel = Math.max(1, storyLayout.offsetHeight - storyStage.offsetHeight);
  const progress = Math.max(0, Math.min(1, -storyLayout.getBoundingClientRect().top / travel));
  const nextStory = Math.min(storyChapters.length - 1, Math.floor(progress * storyChapters.length));
  if (nextStory !== activeStory) {
    activeStory = nextStory;
    document.querySelector('.story-stage').dataset.scene = storyChapters[activeStory].dataset.story;
    storyChapters.forEach((chapter, i) => chapter.classList.toggle('is-current', i === activeStory));
    document.querySelector('.story-stage').style.setProperty('--story-progress', `${(activeStory + 1) / storyChapters.length * 100}%`);
    sendStory();
  }
  const nextAI = visibleChapter(aiChapters);
  if (nextAI !== activeAI) {
    activeAI = nextAI;
    aiChapters.forEach((chapter, i) => chapter.classList.toggle('is-current', i === activeAI));
    aiPicture.dataset.step = String(activeAI);
  }
}
function queueTour() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(updateTour);
}
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== storyFrame.contentWindow) return;
  if (event.data?.type === 'canvas-story-ready') {
    sendStory(false);
  } else if (event.data?.type === 'canvas-story-applied') {
    const step = storyChapters[activeStory]?.dataset.story;
    if (event.data.step !== step || event.data.step !== sentStory) return;
    displayedStory = step;
    updateStoryCaption();
    clearTimeout(revealTimer);
    storyFrame.classList.remove('is-switching');
  }
});
storyFrame.addEventListener('load', () => {
  displayedStory = null;
  sendStory(false);
});
reducedStoryMotion.addEventListener('change', () => sendStory(false));
new ResizeObserver(() => { fitStory(); queueTour(); }).observe(storyViewport);
window.addEventListener('scroll', queueTour, { passive: true });
window.addEventListener('resize', () => { fitStory(); queueTour(); }, { passive: true });
window.addEventListener('pageshow', queueTour);
document.documentElement.classList.add('story-enhanced');
fitStory();
updateTour();

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
const product = document.querySelector('.product-window');
const heroSection = document.querySelector('.hero');
let motionFrame = 0;
function updateScrollMotion() {
  motionFrame = 0;
  dock.classList.toggle('is-scrolled', scrollY > 24);
  if (motionPreference.matches) return;
  const rect = heroSection.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < innerHeight) {
    const progress = Math.min(1, Math.max(0, scrollY / (innerHeight * .85)));
    product.style.setProperty('--hero-tilt', (5 * (1 - progress)) + 'deg');
    product.style.setProperty('--hero-scale', String(.98 + .02 * progress));
    product.style.setProperty('--hero-lift', (-14 * progress) + 'px');
  }
}
window.addEventListener('scroll', () => { if (!motionFrame) motionFrame = requestAnimationFrame(updateScrollMotion); }, {passive:true});
motionPreference.addEventListener('change', () => { product.removeAttribute('style'); updateScrollMotion(); });
document.querySelectorAll('.school-list li').forEach((item,index) => item.style.setProperty('--school-index', String(index)));
if ('IntersectionObserver' in window) {
  const entrance = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); entrance.unobserve(entry.target); }
  }, {threshold:.12});
  document.querySelectorAll('.school-list,.schools-heading,.widget-section>div,.widget-section figure,.story-intro,.ai-intro').forEach(el => {
    if (!el.classList.contains('school-list')) el.classList.add('reveal');
    entrance.observe(el);
  });
}
updateScrollMotion();

const previewCards = [...document.querySelectorAll('.motion-card')];
for (const card of previewCards) {
  const button = card.querySelector('.preview-pause');
  button.addEventListener('click', () => {
    const paused = card.classList.toggle('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', document.documentElement.lang === 'en' ? (paused ? 'Play animation' : 'Pause animation') : (paused ? '播放动画' : '暂停动画'));
    button.textContent = paused ? '▷' : 'Ⅱ';
  });
}
if ('IntersectionObserver' in window) {
  const previews = new IntersectionObserver(entries => {
    for (const entry of entries) entry.target.classList.toggle('is-playing', entry.isIntersecting);
  }, { threshold: .15 });
  previewCards.forEach(card => previews.observe(card));
} else { previewCards.forEach(card => card.classList.add('is-playing')); }
