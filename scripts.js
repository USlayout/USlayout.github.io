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

// モーダル機能
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // スクロール無効化
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // スクロール有効化
    }
}

// サムネイル画像クリック機能
function changeMainImage(thumbnailElement, mainImageId) {
    const mainImage = document.getElementById(mainImageId) || 
                     document.querySelector('.modal-main-image');
    
    if (mainImage && thumbnailElement.src) {
        mainImage.src = thumbnailElement.src;
        mainImage.alt = thumbnailElement.alt;
        
        // アクティブクラスを切り替え
        document.querySelectorAll('.modal-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        thumbnailElement.classList.add('active');
    }
}

// モデルダウンロード機能（仮実装）
function downloadModel() {
    alert('モデルファイルのダウンロード機能は準備中です。');
    // 実際にはここでファイルダウンロード処理を実装
}

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        // 画像拡大表示が開いている場合は優先して閉じる
        const imageFullscreen = document.querySelector('.image-fullscreen.show');
        if (imageFullscreen) {
            closeImageFullscreen();
            return;
        }
        
        // モーダルが開いている場合は閉じる
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// サムネイルクリックイベントを初期化
document.addEventListener('DOMContentLoaded', function() {
    const thumbnails = document.querySelectorAll('.modal-thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            changeMainImage(this);
        });
    });
});

// グローバル関数として定義
window.showModelPreview = showModelPreview;

// 画像拡大表示機能
function showImageFullscreen(imgElement) {
    const fullscreenDiv = document.getElementById('imageFullscreen');
    const fullscreenImg = document.getElementById('fullscreenImage');
    
    if (fullscreenDiv && fullscreenImg && imgElement.src) {
        fullscreenImg.src = imgElement.src;
        fullscreenImg.alt = imgElement.alt;
        fullscreenDiv.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageFullscreen() {
    const fullscreenDiv = document.getElementById('imageFullscreen');
    if (fullscreenDiv) {
        fullscreenDiv.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// モーダル内の画像にクリックイベントを追加
document.addEventListener('DOMContentLoaded', function() {
    const thumbnails = document.querySelectorAll('.modal-thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            changeMainImage(this);
        });
    });
    
    // メイン画像とサムネイル画像にクリックイベントを追加
    const modalImages = document.querySelectorAll('.modal-main-image, .modal-thumbnail');
    modalImages.forEach(img => {
        img.addEventListener('click', function(event) {
            // changeMainImage機能を妨げないよう、少し遅延を入れる
            setTimeout(() => showImageFullscreen(this), 100);
        });
    });
    
    // スキルセクションのアニメーション
    initSkillsAnimation();
});

// スキルアニメーション機能
function initSkillsAnimation() {
    const skillCategories = document.querySelectorAll('.skill-category');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                animateSkillDots(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    skillCategories.forEach(category => {
        observer.observe(category);
    });
}

function animateSkillDots(category) {
    const skillItems = category.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            const dots = item.querySelectorAll('.skill-dot');
            const activeDots = item.querySelectorAll('.skill-dot.active');
            
            // まず全てのドットを非アクティブにする
            dots.forEach(dot => dot.classList.remove('active'));
            
            // アクティブなドットを段階的に表示
            activeDots.forEach((dot, dotIndex) => {
                setTimeout(() => {
                    dots[dotIndex].classList.add('active');
                }, dotIndex * 150);
            });
        }, index * 200);
    });
}