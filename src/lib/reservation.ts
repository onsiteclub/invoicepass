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
