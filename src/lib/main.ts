import { initTelemetry } from './telemetry';
import { initInboxMock } from './inbox-mock';
import { initUptimeBars } from './uptime-bars';
import { initCodeTabs } from './code-tabs';
import { initClaimForms } from './claim';
import { initStubLinks } from './stub-links';
import { initHowModal } from './how-modal';
import { initDevSignup } from './dev-signup';
import { initWelcome } from './welcome';

function init(): void {
  initTelemetry();
  initInboxMock();
  initUptimeBars();
  initCodeTabs();
  initClaimForms();
  initStubLinks();
  initHowModal();
  initDevSignup();
  initWelcome();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
