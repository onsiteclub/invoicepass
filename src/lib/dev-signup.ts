type SavedSignup = {
  email: string;
  name: string;
  building: string;
  submitted_at: string;
};

const STORAGE_KEY = 'ip_dev_signup';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BUILDING_MIN = 20;

function readSaved(): SavedSignup | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSignup;
    if (parsed && parsed.email && parsed.submitted_at) return parsed;
  } catch (_e) {
    /* ignore */
  }
  return null;
}

function persist(record: SavedSignup): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (_e) {
    /* ignore */
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (_e) {
    return iso;
  }
}

function setFieldError(field: HTMLElement, message: string): void {
  const errEl = field.querySelector<HTMLElement>('.dev-field-error');
  if (errEl) errEl.textContent = message;
  field.classList.add('invalid');
}

function clearFieldError(field: HTMLElement): void {
  field.classList.remove('invalid');
  const errEl = field.querySelector<HTMLElement>('.dev-field-error');
  if (errEl) errEl.textContent = '';
}

function validateEmail(input: HTMLInputElement): boolean {
  const field = input.closest('.dev-field') as HTMLElement | null;
  if (!field) return false;
  const v = input.value.trim();
  if (!v) {
    clearFieldError(field);
    return false;
  }
  if (!EMAIL_RE.test(v)) {
    setFieldError(field, 'Use a valid email address');
    return false;
  }
  clearFieldError(field);
  return true;
}

function validateName(input: HTMLInputElement): boolean {
  const field = input.closest('.dev-field') as HTMLElement | null;
  if (!field) return false;
  const v = input.value.trim();
  if (!v) {
    clearFieldError(field);
    return false;
  }
  clearFieldError(field);
  return true;
}

function validateBuilding(input: HTMLTextAreaElement): boolean {
  const field = input.closest('.dev-field') as HTMLElement | null;
  if (!field) return false;
  const v = input.value.trim();
  if (!v) {
    clearFieldError(field);
    return false;
  }
  if (v.length < BUILDING_MIN) {
    setFieldError(field, `${BUILDING_MIN - v.length} more character${BUILDING_MIN - v.length === 1 ? '' : 's'}`);
    return false;
  }
  clearFieldError(field);
  return true;
}

export function initDevSignup(): void {
  const backdrop = document.getElementById('devSignupModal') as HTMLDivElement | null;
  if (!backdrop) return;

  const formView = document.getElementById('devSignupForm') as HTMLDivElement | null;
  const successView = document.getElementById('devSignupSuccess') as HTMLDivElement | null;
  const successBody = document.getElementById('devSuccessBody') as HTMLElement | null;
  const form = document.getElementById('devSignup') as HTMLFormElement | null;
  const emailInput = document.getElementById('devEmail') as HTMLInputElement | null;
  const nameInput = document.getElementById('devName') as HTMLInputElement | null;
  const buildingInput = document.getElementById('devBuilding') as HTMLTextAreaElement | null;
  const submitBtn = document.getElementById('devSignupSubmit') as HTMLButtonElement | null;
  const closeBtn = document.getElementById('devSignupClose') as HTMLButtonElement | null;
  const closeBottomBtn = document.getElementById('devSignupCloseBottom') as HTMLButtonElement | null;

  if (!formView || !successView || !form || !emailInput || !nameInput || !buildingInput || !submitBtn) return;

  function showForm(): void {
    if (!formView || !successView) return;
    formView.hidden = false;
    successView.hidden = true;
  }

  function showSuccess(saved: SavedSignup, returning: boolean): void {
    if (!formView || !successView || !successBody) return;
    formView.hidden = true;
    successView.hidden = false;
    if (returning) {
      successBody.textContent = `You already requested access on ${formatDate(saved.submitted_at)}. We'll be in touch.`;
    } else {
      successBody.textContent = `We'll reach out within 48h. Keep an eye on your inbox — sometimes our first email lands in spam.`;
    }
  }

  function open(): void {
    if (!backdrop) return;
    const saved = readSaved();
    if (saved) showSuccess(saved, true);
    else showForm();
    backdrop.hidden = false;
    // next frame so transition runs
    requestAnimationFrame(() => backdrop.classList.add('open'));
    document.body.style.overflow = 'hidden';
  }

  function close(): void {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      backdrop.hidden = true;
    }, 250);
  }

  function refreshSubmitState(): void {
    if (!submitBtn || !emailInput || !nameInput || !buildingInput) return;
    const ok =
      EMAIL_RE.test(emailInput.value.trim()) &&
      nameInput.value.trim().length > 0 &&
      buildingInput.value.trim().length >= BUILDING_MIN;
    submitBtn.disabled = !ok;
  }

  // open triggers
  document.querySelectorAll<HTMLElement>('[data-dev-signup-open]').forEach(btn => {
    btn.addEventListener('click', open);
  });

  closeBtn?.addEventListener('click', close);
  closeBottomBtn?.addEventListener('click', close);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !backdrop.hidden) close();
  });

  // live state on input clears errors and updates submit
  emailInput.addEventListener('input', () => {
    const field = emailInput.closest('.dev-field') as HTMLElement | null;
    if (field?.classList.contains('invalid')) clearFieldError(field);
    refreshSubmitState();
  });
  emailInput.addEventListener('blur', () => validateEmail(emailInput));

  nameInput.addEventListener('input', () => {
    const field = nameInput.closest('.dev-field') as HTMLElement | null;
    if (field?.classList.contains('invalid')) clearFieldError(field);
    refreshSubmitState();
  });

  buildingInput.addEventListener('input', () => {
    const field = buildingInput.closest('.dev-field') as HTMLElement | null;
    if (field?.classList.contains('invalid')) clearFieldError(field);
    refreshSubmitState();
  });
  buildingInput.addEventListener('blur', () => validateBuilding(buildingInput));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const okEmail = validateEmail(emailInput);
    const okName = validateName(nameInput) && nameInput.value.trim().length > 0;
    const okBuilding = validateBuilding(buildingInput) && buildingInput.value.trim().length >= BUILDING_MIN;
    if (!okEmail || !okName || !okBuilding) return;

    const record: SavedSignup = {
      email: emailInput.value.trim(),
      name: nameInput.value.trim(),
      building: buildingInput.value.trim(),
      submitted_at: new Date().toISOString(),
    };
    persist(record);
    showSuccess(record, false);
  });
}
