import { showToast } from './toast';

// Demo-time reserved handles. Real availability check happens server-side
// when the protocol/portal is wired up; this list keeps the landing
// honest about the fact that not every name is free.
const TAKEN: ReadonlySet<string> = new Set([
  'admin', 'support', 'help', 'team', 'test', 'demo', 'hello', 'info',
  'silva', 'acme', 'stripe', 'paypal', 'amazon', 'google', 'apple',
  'microsoft', 'invoicepass', 'inbox', 'mail', 'contact', 'sales',
  'billing', 'finance', 'accounts', 'root', 'noreply', 'webmaster',
  'postmaster', 'staff', 'office', 'company', 'me', 'you', 'app',
]);

type State = 'empty' | 'short' | 'taken' | 'available';

export function sanitizeHandle(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
}

function getState(handle: string): State {
  if (!handle) return 'empty';
  if (handle.length < 3) return 'short';
  if (TAKEN.has(handle)) return 'taken';
  return 'available';
}

function persist(handle: string): void {
  try {
    localStorage.setItem('ip_pending_handle', handle);
    localStorage.setItem('ip_pending_at', new Date().toISOString());
  } catch (e) {}
}

function attachLiveValidation(form: HTMLFormElement, input: HTMLInputElement): void {
  const claim = form.querySelector<HTMLElement>('.claim');
  const feedback = form.querySelector<HTMLElement>('.claim-feedback');

  function update(): void {
    const cleaned = sanitizeHandle(input.value);
    if (input.value !== cleaned) input.value = cleaned;
    const state = getState(cleaned);

    claim?.classList.remove('is-available', 'is-taken');
    feedback?.classList.remove('available', 'taken');

    if (!feedback) return;
    if (state === 'available') {
      claim?.classList.add('is-available');
      feedback.classList.add('available');
      feedback.textContent = `✓ ${cleaned}@invoicepass.app is available`;
    } else if (state === 'taken') {
      claim?.classList.add('is-taken');
      feedback.classList.add('taken');
      feedback.textContent = `✗ ${cleaned}@invoicepass.app is already taken`;
    } else if (state === 'short') {
      feedback.textContent = '3+ characters · letters, numbers, hyphens';
    } else {
      feedback.textContent = '';
    }
  }

  input.addEventListener('input', update);
  update();
}

function rejectMessage(state: State, handle: string): string {
  if (state === 'taken') return `"${handle}@invoicepass.app" is already taken — try another`;
  if (state === 'short') return 'Handle must be 3+ characters, letters and numbers only';
  return 'Pick a name to claim';
}

function setupForm(opts: {
  formId: string;
  inputId: string;
  onSuccess: (handle: string) => void;
}): { form: HTMLFormElement; input: HTMLInputElement } | null {
  const form = document.getElementById(opts.formId) as HTMLFormElement | null;
  const input = document.getElementById(opts.inputId) as HTMLInputElement | null;
  if (!form || !input) return null;

  attachLiveValidation(form, input);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const handle = sanitizeHandle(input.value.trim());
    const state = getState(handle);
    if (state !== 'available') {
      showToast(rejectMessage(state, handle));
      return;
    }
    persist(handle);
    opts.onSuccess(handle);
  });

  return { form, input };
}

function hideClaimWrap(form: HTMLElement | null): void {
  const wrap = form?.closest('.claim-card, .claim-wrap');
  if (wrap) (wrap as HTMLElement).style.display = 'none';
}

function showSuccessOp(handle: string): void {
  const result = document.getElementById('handleResultOp');
  const email = document.getElementById('handleEmailOp');
  const success = document.getElementById('claimSuccessOp');
  const form = document.getElementById('claimFormOp');
  if (result) result.textContent = handle;
  if (email) email.textContent = handle;
  if (success) success.classList.add('shown');
  hideClaimWrap(form);
}

export function initClaimForms(): void {
  const opForm = setupForm({
    formId: 'claimFormOp',
    inputId: 'handleInputOp',
    onSuccess(handle) {
      showSuccessOp(handle);
      showToast(`Inbox "${handle}@invoicepass.app" reserved`);
    },
  });

  // CTA → propagate handle to hero form and replay submit there
  setupForm({
    formId: 'claimFormBottom',
    inputId: 'handleInputBottom',
    onSuccess(handle) {
      showToast(`Inbox "${handle}@invoicepass.app" reserved · check the top of the page for next steps`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (opForm) {
          opForm.input.value = handle;
          opForm.input.dispatchEvent(new Event('input'));
          opForm.form.dispatchEvent(new Event('submit'));
        }
      }, 600);
    },
  });
}
