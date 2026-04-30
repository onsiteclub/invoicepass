type Persona = 'dev' | 'op';

const STORAGE_KEY = 'ip_persona';
const SHOW_DELAY_MS = 320;

function readPersona(): Persona | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'dev' || v === 'op') return v;
  } catch (_e) {
    /* ignore */
  }
  return null;
}

function persistPersona(p: Persona): void {
  try {
    localStorage.setItem(STORAGE_KEY, p);
  } catch (_e) {
    /* ignore */
  }
}

export function initWelcome(): void {
  const backdrop = document.getElementById('welcomeModal') as HTMLDivElement | null;
  if (!backdrop) return;

  if (readPersona()) return;

  function open(): void {
    if (!backdrop) return;
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function close(): void {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      backdrop.hidden = true;
    }, 220);
  }

  backdrop.querySelectorAll<HTMLButtonElement>('[data-welcome-pick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pick = btn.dataset.welcomePick as Persona | undefined;
      if (pick !== 'dev' && pick !== 'op') return;
      persistPersona(pick);
      if (pick === 'op') {
        window.location.assign('/inbox');
        return;
      }
      close();
    });
  });

  setTimeout(open, SHOW_DELAY_MS);
}
