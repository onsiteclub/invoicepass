import { showToast } from './toast';

export function initCodeTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.code-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      if (!target) return;
      document.querySelectorAll('.code-tab[data-tab]').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.code-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const pane = document.querySelector(`.code-pane[data-pane="${target}"]`);
      if (pane) pane.classList.add('active');
    });
  });

  const copyBtn = document.getElementById('copyBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const active = document.querySelector<HTMLPreElement>('.code-pane.active pre');
    if (!active) return;
    navigator.clipboard.writeText(active.innerText).then(() => {
      copyBtn.textContent = 'copied';
      copyBtn.classList.add('copied');
      showToast('Copied to clipboard');
      setTimeout(() => {
        copyBtn.textContent = 'copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });
}
