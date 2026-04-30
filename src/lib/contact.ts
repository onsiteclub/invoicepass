// Contact-us modal wiring. Submissions are inserted directly into the
// Supabase `contact_messages` table via PostgREST.
//
// SETUP:
//   1. Run migration 013_contact_messages.sql on the Supabase project (the
//      same one the onsite-ops portal uses)
//   2. Copy .env.example to .env and fill PUBLIC_SUPABASE_URL +
//      PUBLIC_SUPABASE_ANON_KEY (Project Settings → API in Supabase Studio)
//   3. Restart `astro dev` so Vite picks the env vars up
//
// Without env vars set, the form falls back to a fake-success path so the
// UX stays intact while you finish wiring things — submissions go nowhere
// in that mode.
//
// Why anon key in the bundle: that's exactly what the anon key is for. RLS
// on contact_messages allows ONLY insert from anon, no select/update/delete.
// A leaked key can't read the submissions.

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';
const CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

interface Refs {
  backdrop: HTMLDivElement;
  form: HTMLFormElement;
  status: HTMLElement;
  submit: HTMLButtonElement;
}

function findRefs(): Refs | null {
  const backdrop = document.getElementById('contactModal') as HTMLDivElement | null;
  const form = document.getElementById('contactForm') as HTMLFormElement | null;
  const status = document.getElementById('contactStatus');
  const submit = form?.querySelector<HTMLButtonElement>('[data-contact-submit]') ?? null;
  if (!backdrop || !form || !status || !submit) return null;
  return { backdrop, form, status, submit };
}

function open(refs: Refs): void {
  refs.backdrop.hidden = false;
  requestAnimationFrame(() => refs.backdrop.classList.add('open'));
  document.body.style.overflow = 'hidden';
  const first = refs.form.querySelector<HTMLInputElement>('input[name="name"]');
  setTimeout(() => first?.focus(), 60);
}

function close(refs: Refs): void {
  refs.backdrop.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    refs.backdrop.hidden = true;
  }, 220);
}

function setStatus(refs: Refs, text: string, kind: '' | 'ok' | 'err'): void {
  refs.status.textContent = text;
  refs.status.className = kind ? `contact-status ${kind}` : 'contact-status';
}

interface ContactPayload {
  name: string;
  email: string;
  company: string | null;
  message: string;
  user_agent: string | null;
}

function buildPayload(data: FormData): ContactPayload {
  const company = String(data.get('company') ?? '').trim();
  const ua = navigator.userAgent ?? '';
  return {
    name: String(data.get('name') ?? '').trim(),
    email: String(data.get('email') ?? '').trim(),
    company: company.length > 0 ? company : null,
    message: String(data.get('message') ?? '').trim(),
    user_agent: ua.length > 0 ? ua.slice(0, 400) : null,
  };
}

async function postToSupabase(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    // Surface the body text in the console for debugging without leaking
    // it in the user-facing error.
    const detail = await res.text().catch(() => '');
    console.error('[contact] supabase insert failed', res.status, detail);
    throw new Error(`HTTP ${res.status}`);
  }
}

async function handleSubmit(refs: Refs, e: Event): Promise<void> {
  e.preventDefault();
  if (refs.submit.disabled) return;

  const data = new FormData(refs.form);

  // Honeypot — bots fill every text field. Silently no-op.
  if (String(data.get('_gotcha') ?? '').length > 0) {
    refs.form.reset();
    return;
  }

  if (!refs.form.checkValidity()) {
    refs.form.reportValidity();
    return;
  }

  refs.submit.disabled = true;
  setStatus(refs, 'Sending…', '');

  // Env not configured — fake the success path so the demo UX still works.
  if (!CONFIGURED) {
    await new Promise(r => setTimeout(r, 700));
    setStatus(refs, "Got it — we'll reply within one business day.", 'ok');
    refs.form.reset();
    refs.submit.disabled = false;
    return;
  }

  try {
    await postToSupabase(buildPayload(data));
    setStatus(refs, "Got it — we'll reply within one business day.", 'ok');
    refs.form.reset();
  } catch {
    setStatus(refs, 'Something went wrong. Please try again in a moment.', 'err');
  } finally {
    refs.submit.disabled = false;
  }
}

export function initContact(): void {
  const refs = findRefs();
  if (!refs) return;

  document.querySelectorAll<HTMLElement>('[data-open-contact]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      open(refs);
    });
  });

  refs.backdrop.querySelector('[data-contact-close]')?.addEventListener('click', () => close(refs));
  refs.backdrop.addEventListener('click', e => {
    if (e.target === refs.backdrop) close(refs);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !refs.backdrop.hidden) close(refs);
  });

  refs.form.addEventListener('submit', e => {
    void handleSubmit(refs, e);
  });
}
