/* Suede's support entry point opens a draft in the visitor's email app. */
(() => {
  const settings = document.currentScript?.dataset || {};
  const widget = document.createElement('aside');
  widget.className = 'suede-support';
  widget.setAttribute('aria-label', 'Suede support');
  widget.innerHTML = `
    <dialog class="suede-support-panel" aria-labelledby="suede-support-title">
      <header>
        <span class="suede-support-avatar" aria-hidden="true">S</span>
        <div><strong id="suede-support-title">Suede support</strong><small>Replies within one business day</small></div>
        <button type="button" class="suede-support-dismiss" aria-label="Close support">×</button>
      </header>
      <p>Ask a question or share your feedback.</p>
      <form class="suede-support-compose">
        <textarea aria-label="Your support message" placeholder="Message…" maxlength="1800" required></textarea>
        <div class="suede-support-actions">
          <a class="suede-support-help">Help center</a>
          <a class="suede-support-contact">Contact</a>
          <button type="submit" disabled>Continue in email</button>
        </div>
      </form>
    </dialog>
    <button type="button" class="suede-support-launch" aria-label="Open support" aria-controls="suede-support-panel" aria-expanded="false">
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path fill="currentColor" d="M4.7 3.2h14.6a2.2 2.2 0 0 1 2.2 2.2v14.9a.6.6 0 0 1-.9.5l-3.8-2.3h-12a2.2 2.2 0 0 1-2.2-2.2V5.4a2.2 2.2 0 0 1 2.1-2.2Z"/>
        <path d="M7.5 12.7c1.1 1.2 2.6 1.7 4.5 1.7s3.5-.5 4.6-1.7" stroke="#111" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </button>`;
  document.body.append(widget);

  const panel = widget.querySelector('.suede-support-panel');
  panel.id = 'suede-support-panel';
  const launcher = widget.querySelector('.suede-support-launch');
  const composer = widget.querySelector('form');
  const field = widget.querySelector('textarea');
  const send = composer.querySelector('button');
  const dismiss = widget.querySelector('.suede-support-dismiss');
  widget.querySelector('.suede-support-help').href = settings.help || 'https://suedeai.ai/support';
  widget.querySelector('.suede-support-contact').href = settings.contact || 'https://suedeai.ai/contact';
  const logo = document.querySelector('.brand img');
  if (logo) {
    const mark = document.createElement('img');
    mark.alt = '';
    mark.src = logo.currentSrc || logo.src;
    widget.querySelector('.suede-support-avatar').replaceChildren(mark);
  }

  const narrow = matchMedia('(max-width: 600px)');
  function show() {
    if (narrow.matches) panel.showModal();
    else panel.show();
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', 'Close support');
    (matchMedia('(pointer: fine)').matches ? field : dismiss).focus({preventScroll:true});
  }

  launcher.addEventListener('click', () => panel.open ? panel.close() : show());
  dismiss.addEventListener('click', () => panel.close());
  panel.addEventListener('close', () => {
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Open support');
    launcher.focus({preventScroll:true});
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.open) panel.close();
  });
  narrow.addEventListener('change', () => { if (panel.open) panel.close(); });
  field.addEventListener('input', () => { send.disabled = !field.value.trim(); });
  composer.addEventListener('submit', event => {
    event.preventDefault();
    const message = field.value.trim();
    if (!message) return;
    const draft = new URL('mailto:support@suedeai.ai');
    draft.search = 'subject=' + encodeURIComponent('Suede support') + '&body=' + encodeURIComponent(message);
    location.href = draft.href;
  });
})();
