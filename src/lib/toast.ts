let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string): void {
  const t = document.getElementById('toast');
  const text = document.getElementById('toastText');
  if (!t || !text) return;

  text.textContent = msg;
  t.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('visible'), 2600);
}
