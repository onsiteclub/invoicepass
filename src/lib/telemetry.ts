const handlePool = [
  'acme-co', 'northpoint', 'vertex-ops', 'hadron-labs',
  'lumiere', 'forge-mfg', 'orbital', 'breakwater',
  'ironside', 'meridian', 'flatline', 'helios-ag',
];

type Method = { txt: string; cls: string };
const methods: Method[] = [
  { txt: 'INGEST', cls: '' },
  { txt: 'DEDUP',  cls: 'ok' },
  { txt: 'SIGN',   cls: 'ok' },
  { txt: 'NOTIFY', cls: 'ok' },
  { txt: 'PARSE',  cls: '' },
  { txt: 'CONFLICT', cls: 'warn' },
];

function pad(n: number): string { return String(n).padStart(2, '0'); }
function timeStr(d: Date): string { return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }

function rndHex(n: number): string {
  const c = 'abcdef0123456789';
  let s = '';
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

function rndAmount(): string {
  const x = (Math.random() * 4000 + 80).toFixed(2);
  return `$${x}`;
}

function makeLine(): string {
  const d = new Date();
  const m = methods[Math.floor(Math.random() * methods.length)];
  const handle = handlePool[Math.floor(Math.random() * handlePool.length)];
  const hash = rndHex(8);
  const amt = rndAmount();

  let msg: string;
  if (m.txt === 'INGEST') msg = `<span class="hash">${handle}</span> · INV-<span class="num">${Math.floor(Math.random() * 9000 + 1000)}</span> · ${amt}`;
  else if (m.txt === 'DEDUP') msg = `<span class="hash">sha256:${hash}</span> · checked`;
  else if (m.txt === 'SIGN') msg = `<span class="hash">${handle}/inv_${hash}</span> · ed25519`;
  else if (m.txt === 'NOTIFY') msg = `<span class="hash">${handle}</span> → POST /webhooks · <span class="num">200</span>`;
  else if (m.txt === 'PARSE') msg = `<span class="hash">XMP</span> · ${Math.floor(Math.random() * 40 + 30)}ms`;
  else msg = `<span class="hash">duplicate flagged · ${rndHex(6)}</span>`;

  return `<div class="tel-line"><span class="tel-time">${timeStr(d)}</span><span class="tel-meth ${m.cls}">${m.txt}</span><span class="tel-msg">${msg}</span></div>`;
}

export function initTelemetry(): void {
  const stream = document.getElementById('telStream');
  if (!stream) return;

  // initial seed
  for (let i = 0; i < 12; i++) stream.innerHTML += makeLine();

  setInterval(() => {
    stream.insertAdjacentHTML('afterbegin', makeLine());
    while (stream.children.length > 14) {
      const last = stream.lastChild;
      if (last) stream.removeChild(last);
    }
  }, 900);

  // Live counters — drift naturally upward
  let today = 14827;
  let latency = 142;
  let dedup = 3.4;

  setInterval(() => {
    today += Math.floor(Math.random() * 4) + 1;
    const el = document.getElementById('statToday');
    if (el) el.textContent = today.toLocaleString();
  }, 1100);

  setInterval(() => {
    latency = Math.max(118, Math.min(168, latency + Math.floor(Math.random() * 11) - 5));
    const lat = document.getElementById('statLatency');
    if (lat) lat.innerHTML = latency + '<span class="unit">ms</span>';

    dedup = Math.max(2.8, Math.min(4.2, dedup + (Math.random() * 0.2 - 0.1)));
    const dd = document.getElementById('statDedup');
    if (dd) dd.innerHTML = dedup.toFixed(1) + '<span class="unit">%</span>';
  }, 2400);
}
