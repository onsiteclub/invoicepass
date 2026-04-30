type Vendor = { n: string; id: string };

const vendors: Vendor[] = [
  { n: 'Stronghold Lumber Co.',     id: 'INV-2487' },
  { n: 'Northland Concrete Supply', id: 'INV-9921' },
  { n: 'Westwood Electric',          id: 'INV-1140' },
  { n: 'Verticé Plumbing Ltd.',     id: 'INV-0556' },
  { n: 'Granite Hardware',           id: 'INV-3308' },
  { n: 'BlueRidge Roofing',          id: 'INV-7714' },
  { n: 'PaintCraft Studio',          id: 'INV-2031' },
  { n: 'Marshall Tools & Rental',    id: 'INV-8842' },
  { n: 'Hudson Drywall Co.',         id: 'INV-4490' },
  { n: 'Cornerstone Glass',          id: 'INV-1665' },
  { n: 'Ironbridge Steel',           id: 'INV-9007' },
  { n: 'Sundeck Outdoor Co.',        id: 'INV-5523' },
];

function rndAmount(): string {
  const v = Math.random();
  let x: string;
  if (v < 0.7) x = (Math.random() * 950 + 80).toFixed(2);
  else if (v < 0.95) x = (Math.random() * 4000 + 950).toFixed(2);
  else x = (Math.random() * 9000 + 4000).toFixed(2);
  return Number(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function makeInboxItem(isNew: boolean): HTMLDivElement {
  const v = vendors[Math.floor(Math.random() * vendors.length)];
  const amt = rndAmount();
  const dup = Math.random() < 0.08;
  const status = dup
    ? '<span class="inbox-status dup"><span class="dot"></span>duplicate</span>'
    : '<span class="inbox-status signed"><span class="dot"></span>signed</span>';

  const div = document.createElement('div');
  div.className = 'inbox-item' + (isNew ? ' new' : '');
  div.innerHTML = `
    <div class="inbox-pdf-icon">PDF</div>
    <div class="inbox-meta">
      <span class="inbox-vendor">${v.n}</span>
      <span class="inbox-num">${v.id}</span>
    </div>
    <span class="inbox-amount">$${amt}</span>
    ${status}
  `;
  return div;
}

export function initInboxMock(): void {
  const inboxList = document.getElementById('inboxList');
  const inboxCount = document.getElementById('inboxCount');
  if (!inboxList || !inboxCount) return;

  let inboxCountVal = 12;

  // seed initial 6
  for (let i = 0; i < 6; i++) inboxList.appendChild(makeInboxItem(false));

  // periodically add new ones at top (only runs while #inboxList is in the DOM)
  setInterval(() => {
    if (!document.body.contains(inboxList)) return;
    inboxList.insertBefore(makeInboxItem(true), inboxList.firstChild);
    inboxCountVal++;
    inboxCount.textContent = `${inboxCountVal} invoices`;
    while (inboxList.children.length > 8) {
      const last = inboxList.lastChild;
      if (last) inboxList.removeChild(last);
    }
  }, 3800);
}
