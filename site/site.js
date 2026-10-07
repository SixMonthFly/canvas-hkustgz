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
  document.querySelectorAll('.school-list,.schools-heading,.widget-section>div,.widget-section figure,.gallery-intro,.ai-intro,.feature-tile,.motion-card,.mcp-showcase').forEach(el => {
    if (!el.classList.contains('school-list')) el.classList.add('reveal');
    entrance.observe(el);
  });
}
updateScrollMotion();

const previewCards = [...document.querySelectorAll('.motion-card,[data-motion-preview]')];
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
