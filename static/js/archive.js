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
      const archiveList = document.querySelector('[data-report-archive]');
      if (archiveList) {
        const archived = (reports.rpr || []).filter((item) => item.date >= '2026-04-01' && item.date < '2026-08-01');
        const months = new Map();
        archived.forEach((item) => {
          const month = item.date.slice(0, 7);
          if (!months.has(month)) months.set(month, []);
          months.get(month).push(item);
        });
        months.forEach((items, month) => {
          const section = document.createElement('section');
          section.className = 'archive-month';
          const heading = document.createElement('h2');
          heading.textContent = `${month.replace('-', '年')}月`;
          section.append(heading);
          const list = document.createElement('div');
          list.className = 'archive-month-list';
          items.forEach((item) => {
            const link = document.createElement('a');
            link.className = 'archive-link';
            link.href = new URL(`rpr/${item.file}`, templatesRoot).href;
            const date = document.createElement('span');
            date.className = 'archive-date';
            date.textContent = dateLabel(item.date);
            const label = document.createElement('span');
            label.className = 'archive-label';
            label.textContent = item.title && !/入力|記入/.test(item.title) ? item.title : '研究経過報告書';
            const arrow = document.createElement('span');
            arrow.className = 'archive-arrow';
            arrow.setAttribute('aria-hidden', 'true');
            arrow.textContent = '↗';
            link.append(date, label, arrow);
            list.append(link);
          });
          section.append(list);
          archiveList.append(section);
        });
        if (!archived.length) archiveList.textContent = '対象期間の報告書はありません。';
      }

      const sidebar = document.querySelector('.sidebar-sticky');
      if (!sidebar) return;
      sidebar.querySelectorAll('.archive-group').forEach((group) => {
        const title = group.querySelector('.archive-title h3')?.textContent?.trim();
        if (title === '研究経過報告書' || title === '実験計画書') group.remove();
      });
      const heading = sidebar.querySelector('.sidebar-heading');
      const currentPath = window.location.pathname;
      const isIndex = window.location.pathname === new URL('index.html', templatesRoot).pathname;
      const reportItems = (reports.rpr || []).filter((item) => !isIndex || item.date >= '2026-10-01');
      const groups = [
        makeGroup('研究経過報告書', 'report-icon', reportItems, currentPath),
        makeGroup('実験計画書', 'plan-icon', reports.ep || [], currentPath),
      ];
      heading.after(...groups);
    })
    .catch(() => {});
})();
