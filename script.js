'use strict';
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach(item => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); }
  });
});
const copyButton = document.getElementById('copy-citation');
copyButton.addEventListener('click', async () => {
  const text = document.getElementById('bibtex').textContent;
  const status = document.getElementById('copy-status');
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    copyButton.textContent = 'Copied ✓';
    status.textContent = 'BibTeX copied to clipboard.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.getElementById('bibtex'));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});
const dialog = document.getElementById('figure-dialog');
const enlarged = document.getElementById('enlarged-figure');
let figureTrigger;
document.querySelectorAll('[data-zoom]').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.showModal) return;
  event.preventDefault(); figureTrigger = link;
  enlarged.src = link.href; enlarged.alt = link.querySelector('img').alt;
  document.getElementById('figure-original').href = link.href;
  dialog.showModal(); document.body.style.overflow = 'hidden';
}));
document.getElementById('close-figure').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const b = dialog.getBoundingClientRect(); if(event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; figureTrigger?.focus(); });

const demoSection = document.getElementById('demos');
if (demoSection) {
  const cases = [...demoSection.querySelectorAll('.demo-case')];
  const selectors = [...demoSection.querySelectorAll('[data-demo-index]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let visible = false;
  function playCurrent() {
    const video = cases[current].querySelector('video');
    if (!video.getAttribute('src')) { video.src = video.dataset.src; video.load(); }
    if (visible && !reducedMotion.matches && !document.hidden) video.play().catch(() => {});
  }
  function chooseDemo(index) {
    cases[current].querySelector('video').pause();
    current = (index + cases.length) % cases.length;
    cases.forEach((item, i) => { item.hidden = i !== current; });
    selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    const video = cases[current].querySelector('video');
    video.currentTime = 0;
    demoSection.querySelector('.demo-status').textContent = cases[current].querySelector('h3').textContent;
    playCurrent();
  }
  selectors.forEach((button, index) => button.addEventListener('click', () => chooseDemo(index)));
  demoSection.querySelector('.demo-prev').addEventListener('click', () => chooseDemo(current - 1));
  demoSection.querySelector('.demo-next').addEventListener('click', () => chooseDemo(current + 1));
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) playCurrent(); else cases[current].querySelector('video').pause();
  }, {threshold: 0.15}).observe(demoSection);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cases[current].querySelector('video').pause(); else if (visible) playCurrent();
  });
}
