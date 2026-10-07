(() => {
  const codeBlocks = [...document.querySelectorAll('[data-code-src]')];

  codeBlocks.forEach(async (code) => {
    const source = code.dataset.codeSrc;
    const card = code.closest('.code-card');
    const button = card?.querySelector('[data-copy]');
    const message = card?.querySelector('.code-message');

    try {
      const response = await fetch(new URL(source, window.location.href));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      code.textContent = await response.text();
      if (button) {
        button.disabled = false;
        button.textContent = 'コードをコピー';
      }
    } catch {
      code.textContent = `ファイルを読み込めませんでした: ${source}`;
      if (message) message.textContent = 'ページをWebサーバー経由で開いているか、公開先にファイルが含まれているか確認してください。';
    }
  });

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const code = document.getElementById(button.dataset.copy);
      const message = button.closest('.code-card')?.querySelector('.code-message');
      if (!code) return;

      try {
        await navigator.clipboard.writeText(code.textContent || '');
        button.textContent = 'コピーしました';
        if (message) message.textContent = 'コードをクリップボードにコピーしました。';
        window.setTimeout(() => { button.textContent = 'コードをコピー'; }, 1600);
      } catch {
        if (message) message.textContent = 'コピーできませんでした。コード欄から選択してコピーしてください。';
      }
    });
  });
})();
