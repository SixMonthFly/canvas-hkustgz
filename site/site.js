const previewPaths = { home: 'demo/index.html', boards: 'demo/index.html?course=1&section=overview', files: 'demo/index.html?course=1&section=files' };
let currentPreview = 'home';
let release = null;
let releaseState = 'loading';
// User-agent data is only a starting choice. Both platforms remain selectable.
let selectedPlatform = /Windows|Win32|Win64/i.test([navigator.userAgentData?.platform, navigator.platform, navigator.userAgent].filter(Boolean).join(' ')) ? 'windows' : 'mac';
const platforms = {
  mac: {
    name: 'Mac', arch: 'Apple Silicon', system: 'macOS 13+', format: 'DMG 安装包', extension: '.dmg',
    compatibility: 'macOS 13+ · Apple Silicon', eyebrow: '开始使用 Mac 版',
    installCompatibility: '适用于 macOS 13 及以上的 Apple Silicon Mac。\n安装后，使用学校账号登录 Canvas。',
    packageNote: 'Intel 版暂未提供', packageDetail: 'DMG · 尚未公证',
    noticeTitle: '首次打开前，请留意',
    noticeCopy: '当前版本尚未经过 Apple 公证，macOS 可能拦截首次启动。请先阅读下方说明，再决定是否安装。',
    helpId: 'first-open', helpLabel: '首次打开说明 ↗',
    steps: [
      ['下载 Mac 版', '获取适用于 M 系列芯片的\nDMG 安装包。', '↓'],
      ['打开安装包', '双击下载的 DMG，\n打开安装窗口。', '◫'],
      ['拖入 Applications', '将应用拖到「应用程序」，\n等待复制完成。', '<span>C</span><b>→</b><span>A</span>'],
      ['开启新学期', '打开应用，点击「同步」，\n完成学校账号登录。', '↗'],
    ],
  },
  windows: {
    name: 'Windows', arch: 'x64', system: 'Windows 10/11', format: 'EXE 一键安装', extension: '.exe',
    compatibility: 'Windows 10/11 · x64', eyebrow: '开始使用 Windows 版',
    installCompatibility: '适用于 Windows 10/11 x64 电脑。\n一键安装后，使用学校账号登录 Canvas。',
    packageNote: '一键安装 · 当前用户', packageDetail: 'EXE · 一键安装',
    noticeTitle: '双击安装，准备就绪',
    noticeCopy: '下载的是完整 EXE 安装包。双击后为当前用户一键安装，完成后自动启动；之后也可从桌面或开始菜单打开。',
    helpId: 'windows-install', helpLabel: 'Windows 安装说明 ↗',
    steps: [
      ['下载 Windows 版', '获取完整 EXE 安装包，\n适用于 Windows x64。', '↓'],
      ['双击，一键安装', '双击下载的 EXE，\n为当前用户完成安装。', '◫'],
      ['安装后自动启动', '也可从桌面或开始菜单的\n快捷方式打开应用。', '↗'],
      ['同步学校课程', '点击应用内的「同步」，\n完成学校账号登录。', '✓'],
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
function packageAvailable(pkg) {
  if (pkg?.available !== true || typeof pkg.filename !== 'string' || !pkg.filename.toLowerCase().endsWith(platforms[selectedPlatform].extension)) return false;
  if (typeof pkg.url !== 'string' || !pkg.url || !Number.isFinite(pkg.size) || pkg.size <= 0) return false;
  try {
    const url = new URL(pkg.url, location.href);
    return ['http:', 'https:'].includes(url.protocol) && decodeURIComponent(url.pathname.split('/').pop()) === pkg.filename;
  } catch { return false; }
}
function unavailableMessage() {
  const name = platforms[selectedPlatform].name;
  if (releaseState === 'loading') return `正在读取 ${name} 安装包信息，请稍候。`;
  if (releaseState === 'error') return `暂时无法读取 ${name} 安装包信息，请稍后刷新页面。`;
  return `${name} 安装包尚未发布，当前暂不可下载。`;
}
function renderPlatform() {
  const platform = platforms[selectedPlatform];
  const pkg = selectedPackage();
  const available = packageAvailable(pkg);
  document.documentElement.dataset.downloadPlatform = selectedPlatform;
  document.querySelectorAll('[data-platform]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.platform === selectedPlatform)));
  document.querySelectorAll('[data-download-nav]').forEach(el => el.textContent = `下载 ${platform.name} 版`);
  document.querySelectorAll('[data-download-label]').forEach(el => {
    el.textContent = available || releaseState === 'loading' ? `下载 ${platform.name} 版` : `${platform.name} 版暂不可下载`;
  });
  document.querySelectorAll('[data-version]').forEach(el => el.textContent = pkg?.version ? `v${pkg.version}` : releaseState === 'loading' ? '读取版本中' : '版本待发布');
  for (const key of ['arch', 'system', 'format', 'compatibility']) {
    document.querySelectorAll(`[data-platform-${key}]`).forEach(el => el.textContent = platform[key]);
  }
  document.querySelectorAll('[data-download]').forEach(link => {
    link.setAttribute('aria-disabled', String(!available));
    if (available) { link.href = pkg.url; link.setAttribute('download', pkg.filename); }
    else { link.href = '#download'; link.removeAttribute('download'); }
  });
  document.querySelector('#package-detail').textContent = available
    ? `v${pkg.version} · ${(pkg.size / 1000 / 1000).toFixed(1)} MB · ${platform.packageDetail}`
    : unavailableMessage();
  document.querySelector('#checksum-value').textContent = available && pkg.sha256
    ? `${pkg.filename}\nSHA-256\n${pkg.sha256}`
    : `${platform.name} 安装包发布后显示 SHA-256。`;
  document.querySelector('#platform-package-note').textContent = platform.packageNote;
  document.querySelector('[data-install-eyebrow]').textContent = platform.eyebrow;
  document.querySelector('#install-compatibility').textContent = platform.installCompatibility;
  document.querySelector('#install-notice-title').textContent = platform.noticeTitle;
  document.querySelector('#install-notice-copy').textContent = platform.noticeCopy;
  for (const id of ['install-notice-link', 'package-install-link']) {
    const link = document.getElementById(id);
    link.href = `#${platform.helpId}`;
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
let activeStory = -1;
let activeAI = -1;
let scrollQueued = false;
let displayedStory = null;
let sentStory = null;
let fadeTimer;
let revealTimer;
let sceneRevision = 0;
const reducedStoryMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
      if (revision === sceneRevision) storyFrame.classList.remove('is-switching');
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
  const stage = document.querySelector('.story-stage');
  const figure = document.querySelector('.ai-figure');
  // Fit the full window and its caption in short desktop viewports as well.
  stage.style.maxWidth = innerWidth > 800 ? `${Math.max(360, (innerHeight - 150) * 1180 / 800)}px` : '';
  figure.style.maxWidth = innerWidth > 800 ? `${Math.max(360, (innerHeight - 130) * 1200 / 850)}px` : '';
  storyFrame.style.setProperty('--demo-scale', String(storyViewport.clientWidth / 1180));
  stage.style.setProperty('--stage-top', `${Math.max(22, (innerHeight - stage.offsetHeight) / 2)}px`);
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
  const nextStory = visibleChapter(storyChapters);
  if (nextStory !== activeStory) {
    activeStory = nextStory;
    storyChapters.forEach((chapter, i) => chapter.classList.toggle('is-current', i === activeStory));
    storyCaption.textContent = storyChapters[activeStory].querySelector('h3').textContent;
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
