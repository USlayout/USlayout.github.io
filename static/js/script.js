(() => {
  async function showLatestReport() {
    const target = document.querySelector('.latest-report');
    if (!target) return;

    try {
      const manifestResponse = await fetch(new URL('reports.json', window.location.href));
      if (!manifestResponse.ok) return;
      const manifest = await manifestResponse.json();
      const latest = manifest.rpr?.find((report) => report.date >= '2026-10-01');
      if (!latest) return;

      const reportUrl = new URL(`rpr/${latest.file}`, window.location.href);
      const reportResponse = await fetch(reportUrl);
      if (!reportResponse.ok) return;
      const reportDocument = new DOMParser().parseFromString(await reportResponse.text(), 'text/html');
      const source = reportDocument.querySelector('.article-paper');
      if (!source) return;

      source.querySelectorAll('[href], [src]').forEach((element) => {
        for (const attribute of ['href', 'src']) {
          const value = element.getAttribute(attribute);
          if (value) element.setAttribute(attribute, new URL(value, reportUrl).href);
        }
      });
      source.classList.add('latest-report');
      target.replaceWith(source);
    } catch {
      // Keep the saved report on the page if the report list cannot be loaded.
    }
  }

  showLatestReport();

  const inputs = [...document.querySelectorAll('[data-task]')];
  if (!inputs.length) return;

  const storageKey = 'research-journal-checklist-v1';
  let saved = {};
  try {
    saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}') || {};
  } catch {
    saved = {};
  }

  const progress = document.querySelector('[data-progress]');
  const total = document.querySelector('[data-total]');

  function update() {
    const completed = inputs.filter((input) => input.checked).length;
    if (progress) progress.textContent = String(completed);
    if (total) total.textContent = String(inputs.length);
  }

  inputs.forEach((input) => {
    input.checked = Object.prototype.hasOwnProperty.call(saved, input.dataset.task)
      ? Boolean(saved[input.dataset.task])
      : input.checked;
    input.addEventListener('change', () => {
      saved[input.dataset.task] = input.checked;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(saved));
      } catch {
        // Keep the checklist usable if storage is unavailable.
      }
      update();
    });
  });

  update();
})();
