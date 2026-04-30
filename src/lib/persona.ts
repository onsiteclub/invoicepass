import { showToast } from './toast';

type Persona = 'dev' | 'op';

function applyPersona(p: Persona): void {
  document.body.classList.remove('persona-dev', 'persona-op');
  document.body.classList.add(`persona-${p}`);
  const label = document.getElementById('personaLabel');
  if (label) label.textContent = p === 'dev' ? 'developer view' : 'operator view';
  try { localStorage.setItem('ip_persona', p); } catch (e) {}
}

function showPersonaModal(): void {
  const m = document.getElementById('personaModal');
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function hidePersonaModal(): void {
  const m = document.getElementById('personaModal');
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
}

export function initPersona(): void {
  const personaSwitch = document.getElementById('personaSwitch');

  document.querySelectorAll<HTMLButtonElement>('.persona-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.persona as Persona | undefined;
      if (!p) return;
      applyPersona(p);
      hidePersonaModal();
    });
  });

  if (personaSwitch) {
    personaSwitch.addEventListener('click', () => {
      const cur: Persona = document.body.classList.contains('persona-dev') ? 'dev' : 'op';
      const next: Persona = cur === 'dev' ? 'op' : 'dev';
      applyPersona(next);
      showToast(`Switched to ${next === 'dev' ? 'developer' : 'operator'} view`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // initial load
  let saved: string | null = null;
  try { saved = localStorage.getItem('ip_persona'); } catch (e) {}
  if (saved === 'dev' || saved === 'op') {
    applyPersona(saved);
  } else {
    // first visit — default to dev so layout doesn't flash, then show modal
    applyPersona('dev');
    setTimeout(showPersonaModal, 350);
  }
}
