import { showToast } from './toast';

export function initStubLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-stub]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showToast('Section under construction');
    });
  });
}
