export function initHowModal(): void {
  const howModal = document.getElementById('howModal');
  if (!howModal) return;

  function openModal(): void {
    howModal!.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(): void {
    howModal!.classList.remove('open');
    document.body.style.overflow = '';
  }

  const triggers = ['howLinkTop', 'howLinkBottom', 'howLinkOp'];
  triggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', openModal);
  });

  const closeBtn = document.getElementById('modalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  howModal.addEventListener('click', e => {
    if (e.target === howModal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && howModal.classList.contains('open')) closeModal();
  });
}
