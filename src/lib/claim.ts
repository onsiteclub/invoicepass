import { showToast } from './toast';

export function sanitizeHandle(v: string): string {
  return v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
}

function persist(handle: string): void {
  try {
    localStorage.setItem('ip_pending_handle', handle);
    localStorage.setItem('ip_pending_at', new Date().toISOString());
  } catch (e) {}
}

function attachInputSanitizer(input: HTMLInputElement): void {
  input.addEventListener('input', e => {
    const t = e.target as HTMLInputElement;
    t.style.borderColor = '';
    t.value = sanitizeHandle(t.value);
  });
}

function showSuccessTop(handle: string): void {
  const result = document.getElementById('handleResult');
  const email = document.getElementById('handleEmail');
  const success = document.getElementById('claimSuccess');
  const form = document.getElementById('claimForm');
  if (result) result.textContent = handle;
  if (email) email.textContent = handle;
  if (success) success.classList.add('shown');
  if (form) (form as HTMLFormElement).style.display = 'none';

  // hide the label-row + claim-note that sit above and below the dev-hero form
  const heroBlock = form?.closest('.dev-only');
  heroBlock?.querySelector<HTMLElement>('.claim-label-row')?.style.setProperty('display', 'none');
  heroBlock?.querySelector<HTMLElement>('.claim-note')?.style.setProperty('display', 'none');
}

function showSuccessOp(handle: string): void {
  const result = document.getElementById('handleResultOp');
  const email = document.getElementById('handleEmailOp');
  const success = document.getElementById('claimSuccessOp');
  const form = document.getElementById('claimFormOp');
  if (result) result.textContent = handle;
  if (email) email.textContent = handle;
  if (success) success.classList.add('shown');
  if (form) (form as HTMLFormElement).style.display = 'none';

  const heroBlock = form?.closest('.op-only');
  heroBlock?.querySelector<HTMLElement>('.claim-label-row')?.style.setProperty('display', 'none');
  heroBlock?.querySelector<HTMLElement>('.claim-note')?.style.setProperty('display', 'none');
}

export function initClaimForms(): void {
  // Top form (dev hero)
  const form = document.getElementById('claimForm') as HTMLFormElement | null;
  const input = document.getElementById('handleInput') as HTMLInputElement | null;
  if (form && input) {
    attachInputSanitizer(input);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const handle = sanitizeHandle(input.value.trim());
      if (!handle || handle.length < 3) {
        input.style.borderColor = 'var(--red)';
        showToast('Handle must be 3+ characters, letters and numbers only');
        return;
      }
      persist(handle);
      showSuccessTop(handle);
      showToast(`Inbox "${handle}@invoicepass.app" reserved`);
    });
  }

  // Bottom (CTA) form — scrolls back up and triggers the top one
  const formBottom = document.getElementById('claimFormBottom') as HTMLFormElement | null;
  const inputBottom = document.getElementById('handleInputBottom') as HTMLInputElement | null;
  if (formBottom && inputBottom) {
    attachInputSanitizer(inputBottom);
    formBottom.addEventListener('submit', e => {
      e.preventDefault();
      const handle = sanitizeHandle(inputBottom.value.trim());
      if (!handle || handle.length < 3) {
        inputBottom.style.borderColor = 'var(--red)';
        showToast('Handle must be 3+ characters, letters and numbers only');
        return;
      }
      persist(handle);
      showToast(`Inbox "${handle}@invoicepass.app" reserved · check the top of the page for next steps`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (input && form) {
          input.value = handle;
          input.dispatchEvent(new Event('input'));
          form.dispatchEvent(new Event('submit'));
        }
      }, 600);
    });
  }

  // Operator hero form
  const formOp = document.getElementById('claimFormOp') as HTMLFormElement | null;
  const inputOp = document.getElementById('handleInputOp') as HTMLInputElement | null;
  if (formOp && inputOp) {
    attachInputSanitizer(inputOp);
    formOp.addEventListener('submit', e => {
      e.preventDefault();
      const handle = sanitizeHandle(inputOp.value.trim());
      if (!handle || handle.length < 3) {
        inputOp.style.borderColor = 'var(--red)';
        showToast('Handle must be 3+ characters, letters and numbers only');
        return;
      }
      persist(handle);
      showSuccessOp(handle);
      showToast(`Inbox "${handle}@invoicepass.app" reserved`);
    });
  }
}
