import { showToast } from './toast';
import { buildPortalUrl, createReservation } from './reservation';
import { isReservedHandle } from './reserved-handles';

type State = 'empty' | 'short' | 'taken' | 'available' | 'checking';

const PORTAL_CHECK_URL = 'https://portal.invoicepass.app/api/auth/check-username';
const DEBOUNCE_MS = 400;

// Session-scoped cache: handle -> available. Avoids re-querying as the user
// edits and re-types the same handle. We only cache *confirmed* responses
// (true/false), never network errors — those should be retried.
const remoteCache = new Map<string, boolean>();

export function sanitizeHandle(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
}

function localState(handle: string): State {
  if (!handle) return 'empty';
  if (handle.length < 3) return 'short';
  if (isReservedHandle(handle)) return 'taken';
  return 'available';
}

async function checkRemote(handle: string, signal: AbortSignal): Promise<boolean | null> {
  try {
    const res = await fetch(`${PORTAL_CHECK_URL}?username=${encodeURIComponent(handle)}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { available?: boolean };
    return typeof data.available === 'boolean' ? data.available : null;
  } catch (_e) {
    return null;
  }
}

function attachLiveValidation(form: HTMLFormElement, input: HTMLInputElement): {
  getCurrentState: () => State;
  getCurrentHandle: () => string;
} {
  const claim = form.querySelector<HTMLElement>('.claim');
  const feedback = form.querySelector<HTMLElement>('.claim-feedback');

  let currentState: State = 'empty';
  let currentHandle = '';
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let activeController: AbortController | null = null;

  function paint(state: State, handle: string): void {
    currentState = state;
    currentHandle = handle;

    claim?.classList.remove('is-available', 'is-taken', 'is-checking');
    feedback?.classList.remove('available', 'taken');

    if (!feedback) return;
    if (state === 'available') {
      claim?.classList.add('is-available');
      feedback.classList.add('available');
      feedback.textContent = `✓ ${handle}@invoicepass.app is available`;
    } else if (state === 'taken') {
      claim?.classList.add('is-taken');
      feedback.classList.add('taken');
      feedback.textContent = `${handle}@invoicepass.app isn't available — pick another`;
    } else if (state === 'checking') {
      claim?.classList.add('is-checking');
      feedback.textContent = `Checking ${handle}@invoicepass.app…`;
    } else if (state === 'short') {
      feedback.textContent = '3+ characters · letters, numbers, hyphens';
    } else {
      feedback.textContent = '';
    }
  }

  function cancelInflight(): void {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (activeController) {
      activeController.abort();
      activeController = null;
    }
  }

  function update(): void {
    const cleaned = sanitizeHandle(input.value);
    if (input.value !== cleaned) input.value = cleaned;

    const local = localState(cleaned);

    // Anything that fails locally short-circuits — no need to ask the portal.
    if (local !== 'available') {
      cancelInflight();
      paint(local, cleaned);
      return;
    }

    // Locally OK. If we already know the remote answer, use it.
    const cached = remoteCache.get(cleaned);
    if (cached === true) {
      cancelInflight();
      paint('available', cleaned);
      return;
    }
    if (cached === false) {
      cancelInflight();
      paint('taken', cleaned);
      return;
    }

    // Need to ask the portal. Cancel any prior in-flight, show "checking",
    // then fire after a short debounce.
    cancelInflight();
    paint('checking', cleaned);

    debounceTimer = setTimeout(() => {
      const controller = new AbortController();
      activeController = controller;
      void checkRemote(cleaned, controller.signal).then(available => {
        if (controller.signal.aborted) return;
        if (available === null) {
          // Network/server error — fail open at the hero. Portal validates
          // again at signup; better than a stuck spinner blocking the user.
          paint('available', cleaned);
          return;
        }
        remoteCache.set(cleaned, available);
        paint(available ? 'available' : 'taken', cleaned);
      });
    }, DEBOUNCE_MS);
  }

  input.addEventListener('input', update);
  update();

  return {
    getCurrentState: () => currentState,
    getCurrentHandle: () => currentHandle,
  };
}

function rejectMessage(state: State, handle: string): string {
  if (state === 'taken') return `"${handle}@invoicepass.app" isn't available — pick another`;
  if (state === 'short') return '3+ characters: letters, numbers, hyphens';
  if (state === 'checking') return 'Still checking — one moment…';
  return 'Pick a name to claim';
}

function setupForm(opts: {
  formId: string;
  inputId: string;
  onSuccess: (handle: string) => void;
}): void {
  const form = document.getElementById(opts.formId) as HTMLFormElement | null;
  const input = document.getElementById(opts.inputId) as HTMLInputElement | null;
  if (!form || !input) return;

  const live = attachLiveValidation(form, input);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const handle = sanitizeHandle(input.value.trim());
    const local = localState(handle);

    if (local !== 'available') {
      showToast(rejectMessage(local, handle));
      return;
    }

    // Local checks pass. Consult the remote view if we have one.
    const cached = remoteCache.get(handle);
    if (cached === false) {
      showToast(rejectMessage('taken', handle));
      return;
    }
    if (cached === undefined && live.getCurrentState() === 'checking') {
      showToast(rejectMessage('checking', handle));
      return;
    }
    // cached === true OR remote check failed (fail-open) → proceed.
    opts.onSuccess(handle);
  });
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
