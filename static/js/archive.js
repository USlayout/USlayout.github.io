(() => {
  const script = document.currentScript || document.querySelector('script[src$="archive.js"]');
  if (!script) return;

  const templatesRoot = new URL('../../templates/', script.src);
  const manifestUrl = new URL('reports.json', templatesRoot);
  const dateLabel = (date) => date.replaceAll('-', '.');

  function makeGroup(title, icon, items, currentPath) {
    const group = document.createElement('section');
    group.className = 'archive-group';
    const heading = document.createElement('div');
    heading.className = 'archive-title';
    heading.innerHTML = `<span class="archive-icon ${icon}" aria-hidden="true">${icon === 'report-icon' ? '▤' : '⌑'}</span>`;
    const label = document.createElement('h3');
    label.textContent = title;
    const count = document.createElement('span');
    count.className = 'archive-count';
    count.textContent = String(items.length).padStart(2, '0');
    heading.append(label, count);
    group.append(heading);

    items.forEach((item) => {
      const href = new URL(`${title === '研究経過報告書' ? 'rpr' : 'ep'}/${item.file}`, templatesRoot);
      const link = document.createElement('a');
      link.className = 'archive-link';
      if (href.pathname === currentPath) {
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'page');
      }
      link.href = href.href;
      const date = document.createElement('span');
      date.className = 'archive-date';
      date.textContent = dateLabel(item.date);
      const text = document.createElement('span');
      text.className = 'archive-label';
      text.textContent = item.title && !/入力|記入/.test(item.title) ? item.title : title;
      const arrow = document.createElement('span');
      arrow.className = 'archive-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      link.append(date, text, arrow);
      group.append(link);
    });
    return group;
  }

  fetch(manifestUrl)
    .then((response) => {
      if (!response.ok) throw new Error('Report list is unavailable');
      return response.json();
    })
    .then((reports) => {
      const sidebar = document.querySelector('.sidebar-sticky');
      if (!sidebar) return;
      sidebar.querySelectorAll('.archive-group').forEach((group) => {
        const title = group.querySelector('.archive-title h3')?.textContent?.trim();
        if (title === '研究経過報告書' || title === '実験計画書') group.remove();
      });
      const heading = sidebar.querySelector('.sidebar-heading');
      const currentPath = window.location.pathname;
      const groups = [
        makeGroup('研究経過報告書', 'report-icon', reports.rpr || [], currentPath),
        makeGroup('実験計画書', 'plan-icon', reports.ep || [], currentPath),
      ];
      heading.after(...groups);
    })
    .catch(() => {});
})();
