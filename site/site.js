const previewPaths = { home: 'demo/index.html', boards: 'demo/index.html?course=1&section=overview', files: 'demo/index.html?course=1&section=files' };
let currentPreview = 'home';
let release = null;
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
async function loadRelease() {
  try {
    const response = await fetch('release.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Release unavailable');
    release = await response.json();
    document.querySelectorAll('[data-version]').forEach(el => el.textContent = 'v' + release.version);
    const available = release.available === true;
    document.querySelectorAll('[data-download]').forEach(link => {
      if (available) { link.href = release.url; link.setAttribute('download', release.filename); }
      else { link.href = '#download'; link.removeAttribute('download'); }
    });
    document.querySelector('#package-detail').textContent = available ? `v${release.version} · ${(release.size / 1000 / 1000).toFixed(1)} MB · DMG · 尚未公证` : 'DMG 安装包尚未发布，当前暂不可下载';
    document.querySelector('#checksum-value').textContent = available ? 'SHA-256\n' + release.sha256 : '安装包准备完成后显示 SHA-256。';
  } catch {
    document.querySelector('#package-detail').textContent = '暂时无法读取安装包信息，请稍后刷新页面。';
  }
}
document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click', event => {
  if (!release?.available) { event.preventDefault(); notify('DMG 安装包尚未发布，请稍后再试。'); }
}));
loadRelease();
