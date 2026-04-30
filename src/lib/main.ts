import { initTelemetry } from './telemetry';
import { initInboxMock } from './inbox-mock';
import { initUptimeBars } from './uptime-bars';
import { initCodeTabs } from './code-tabs';
import { initClaimForms } from './claim';
import { initStubLinks } from './stub-links';
import { initHowModal } from './how-modal';
import { initPersona } from './persona';

function init(): void {
  initTelemetry();
  initInboxMock();
  initUptimeBars();
  initCodeTabs();
  initClaimForms();
  initStubLinks();
  initHowModal();
  initPersona();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
