// Soft reservation handoff to portal.invoicepass.app.
//
// PORTAL TODO (separate project, portal.invoicepass.app):
//   1. /signup reads ?handle and ?exp from query string
//   2. POST /api/reservations { handle } → server-side hold (15min TTL)
//      - reject if handle already held by another session or already claimed
//      - return signed JWT { handle, exp } so client can't tamper
//   3. On email-verify: extend hold to 24h
//   4. On signup completion: convert hold to permanent ownership
//   5. Cron: release expired holds
// The landing only carries the handle + intended expiration. The portal owns truth.

const STORAGE_KEY = 'ip_reservation';
const TTL_MS = 15 * 60 * 1000;
const PORTAL_URL = 'https://portal.invoicepass.app/signup';

export interface Reservation {
  handle: string;
  createdAt: number;
  expiresAt: number;
}

export function createReservation(handle: string): Reservation {
  const now = Date.now();
  const reservation: Reservation = {
    handle,
    createdAt: now,
    expiresAt: now + TTL_MS,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservation));
  } catch (_e) {
    /* ignore */
  }
  return reservation;
}

export function readReservation(): Reservation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Reservation;
    if (typeof parsed.handle !== 'string' || typeof parsed.expiresAt !== 'number') return null;
    if (parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (_e) {
    return null;
  }
}

export function clearReservation(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_e) {
    /* ignore */
  }
}

export function buildPortalUrl(reservation: Reservation): string {
  const params = new URLSearchParams({
    handle: reservation.handle,
    exp: String(reservation.expiresAt),
  });
  return `${PORTAL_URL}?${params.toString()}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
}

interface CountdownRefs {
  card: HTMLElement;
  timer: HTMLElement;
  portal: HTMLAnchorElement;
  expired: HTMLElement;
  active: HTMLElement;
}

function findRefs(card: HTMLElement): CountdownRefs | null {
  const timer = card.querySelector<HTMLElement>('[data-claim-timer]');
  const portal = card.querySelector<HTMLAnchorElement>('[data-claim-portal]');
  const expired = card.querySelector<HTMLElement>('[data-claim-expired]');
  const active = card.querySelector<HTMLElement>('[data-claim-active]');
  if (!timer || !portal || !expired || !active) return null;
  return { card, timer, portal, expired, active };
}

function showExpired(refs: CountdownRefs, onRetry: () => void): void {
  refs.active.hidden = true;
  refs.expired.hidden = false;
  const retry = refs.expired.querySelector<HTMLButtonElement>('[data-claim-retry]');
  if (retry && !retry.dataset.bound) {
    retry.dataset.bound = '1';
    retry.addEventListener('click', () => {
      clearReservation();
      onRetry();
    });
  }
}

export function startCountdown(reservation: Reservation, card: HTMLElement, onRetry: () => void): void {
  const refs = findRefs(card);
  if (!refs) return;

  refs.portal.href = buildPortalUrl(reservation);
  refs.active.hidden = false;
  refs.expired.hidden = true;

  function tick(): void {
    if (!refs) return;
    const remaining = reservation.expiresAt - Date.now();
    if (remaining <= 0) {
      refs.timer.textContent = '00:00';
      clearReservation();
      showExpired(refs, onRetry);
      window.clearInterval(intervalId);
      return;
    }
    refs.timer.textContent = formatRemaining(remaining);
  }

  tick();
  const intervalId = window.setInterval(tick, 1000);
}
