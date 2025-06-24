document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // ヘッダーのスクロール効果
window.addEventListener('scroll', function() {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        });

        // 画像読み込みエラーハンドリング
document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', function() {
                this.style.display = 'none';
                const fallback = this.nextElementSibling;
                if (fallback) {
                    fallback.style.display = 'flex';
                }
            });
        });
function showModelPreview(imgElement) {
    // main.jsで定義された関数を呼び出し
    if (window.showModelPreview) {
        window.showModelPreview(imgElement);
    } else {
        // フォールバック
        imgElement.style.display = 'none';
        const fallback = imgElement.nextElementSibling;
        if (fallback) {
            fallback.style.display = 'flex';
            fallback.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#666;">3Dモデル読み込み中...</div>';
        }
    }
}

document.querySelectorAll('.model-link').forEach(link => {
    link.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        if (url) {
            window.open(url, '_blank'); // 新しいタブで開く場合
            // location.href = url; // 同じタブで開く場合はこちら
        }
    });
});

// グローバル関数として定義
window.showModelPreview = showModelPreview;