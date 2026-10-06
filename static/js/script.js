(() => {
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
