import { initClaimForms } from './claim';
import { initStubLinks } from './stub-links';
import { initHowModal } from './how-modal';
import { initContact } from './contact';

function init(): void {
  initClaimForms();
  initStubLinks();
  initHowModal();
  initContact();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
