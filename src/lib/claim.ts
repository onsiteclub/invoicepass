import { showToast } from './toast';
import { buildPortalUrl, createReservation } from './reservation';
import { isReservedHandle } from './reserved-handles';

type State = 'empty' | 'short' | 'taken' | 'available';

export function sanitizeHandle(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
}

function getState(handle: string): State {
  if (!handle) return 'empty';
  if (handle.length < 3) return 'short';
  if (isReservedHandle(handle)) return 'taken';
  return 'available';
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
      feedback.textContent = `${cleaned}@invoicepass.app isn't available — pick another`;
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
  if (state === 'taken') return `"${handle}@invoicepass.app" isn't available — pick another`;
  if (state === 'short') return '3+ characters: letters, numbers, hyphens';
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
    opts.onSuccess(handle);
  });

  return { form, input };
}

function handoffToPortal(handle: string): void {
  const reservation = createReservation(handle);
  window.location.href = buildPortalUrl(reservation);
}

export function initClaimForms(): void {
  setupForm({
    formId: 'claimFormOp',
    inputId: 'handleInputOp',
    onSuccess: handoffToPortal,
  });

  setupForm({
    formId: 'claimFormBottom',
    inputId: 'handleInputBottom',
    onSuccess: handoffToPortal,
  });
}
