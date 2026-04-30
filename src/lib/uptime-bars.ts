export function initUptimeBars(): void {
  document.querySelectorAll<HTMLElement>('.uptime-bar').forEach(bar => {
    const pattern = bar.dataset.pattern;
    const total = 90;
    let html = '';
    for (let i = 0; i < total; i++) {
      let cls = '';
      if (pattern === 'one-blip' && i === 67) cls = 'partial';
      html += `<div class="uptime-tick ${cls}"></div>`;
    }
    bar.innerHTML = html;
  });
}
