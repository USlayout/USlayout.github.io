
    // 1. Three.jsライブラリの読み込み
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';


let scene, camera, renderer, controls;
let currentMesh, currentMixer;
let rotationSpeed = 1;
let autoRotate = false;
let ambientLight, directionalLight, pointLight;

// GLTFローダー
const loader = new GLTFLoader();

// 作品データ（パスを指定）
// ここにあなたのGLBファイルの情報を設定してください
const artworks = [
    {
        id: 'sample1',
        title: 'サンプル作品1',
        description: 'GLBファイルのパスを正しく設定してください',
        path: 'model/test.glb'  // ← ここにあなたのGLBファイルのパスを入力
    },
    {
        id: 'sample2', 
        title: 'サンプル作品2',
        description: '2つ目のモデルファイル',
        path: 'model/test2.glb'  // ← ここにあなたのGLBファイルのパスを入力
    }
    // 作品を追加する場合は、ここに同じ形式で追加してください
];

// 初期化
function init() {
    // シーンの作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // カメラの設定
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // レンダラーの設定
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // コントロールの設定
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 50;
    controls.minDistance = 1;

    // ライティング
    setupLighting();

    // UI要素の生成
    generateArtworkCards();

    // イベントリスナー
    setupEventListeners();

    // アニメーションループ開始
    animate();
}

// ライティングの設定
function setupLighting() {
    ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    pointLight = new THREE.PointLight(0x4ecdc4, 0.8);
    pointLight.position.set(-5, -5, 3);
    scene.add(pointLight);

    // 環境マップ（オプション）
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
}

// 作品カードの生成
function generateArtworkCards() {
    const grid = document.getElementById('artwork-grid');
    
    artworks.forEach((artwork, index) => {
        const card = document.createElement('div');
        card.className = 'artwork-card';
        card.dataset.artwork = artwork.id;
        
        card.innerHTML = `
            <div class="artwork-title">${artwork.title}</div>
            <div class="artwork-description">${artwork.description}</div>
            <div class="artwork-path">${artwork.path}</div>
        `;
        
        card.addEventListener('click', () => loadArtwork(artwork));
        grid.appendChild(card);
    });
}

// 作品の読み込み
function loadArtwork(artwork) {
    showLoading(true);
    
    // 以前のモデルを削除
    if (currentMesh) {
        scene.remove(currentMesh);
        if (currentMesh.traverse) {
            currentMesh.traverse((child) => {
                if (child.geometry) {
                    child.geometry.dispose();
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }
    }
    
    // アニメーションミキサーをクリア
    if (currentMixer) {
        currentMixer.stopAllActions();
        currentMixer = null;
    }

    // カードの状態を更新
    document.querySelectorAll('.artwork-card').forEach(card => {
        card.classList.remove('active', 'loading');
    });
    
    const activeCard = document.querySelector(`[data-artwork="${artwork.id}"]`);
    activeCard.classList.add('active', 'loading');

    // GLBファイルの読み込み
    loader.load(
        artwork.path,
        (gltf) => {
            showLoading(false);
            activeCard.classList.remove('loading');
            
            currentMesh = gltf.scene;
            
            // モデルのスケールと位置を調整
            const box = new THREE.Box3().setFromObject(currentMesh);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            currentMesh.scale.multiplyScalar(scale);
            
            currentMesh.position.sub(center.multiplyScalar(scale));
            
            // 影の設定
            currentMesh.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            scene.add(currentMesh);
            
            // アニメーションの設定
            if (gltf.animations && gltf.animations.length > 0) {
                currentMixer = new THREE.AnimationMixer(currentMesh);
                gltf.animations.forEach((clip) => {
                    currentMixer.clipAction(clip).play();
                });
            }
            
            // カメラ位置をリセット
            resetCameraPosition();
            
            // 情報パネルの更新
            updateInfoPanel(artwork);
        },
        (progress) => {
            // 読み込み進行状況（オプション）
            console.log('Loading progress:', progress);
        },
        (error) => {
            showLoading(false);
            activeCard.classList.remove('loading');
            showError(`モデルの読み込みに失敗しました: ${artwork.path}`, error);
        }
    );
}

// 情報パネルの更新
function updateInfoPanel(artwork) {
    document.getElementById('artwork-info').innerHTML = 
        `<strong>${artwork.title}</strong><br>${artwork.description}<br><br>
        マウスドラッグで回転、ホイールでズーム<br>
        右クリックドラッグでパン`;
}

// カメラ位置のリセット
function resetCameraPosition() {
    camera.position.set(0, 0, 5);
    controls.reset();
}

// ローディング表示の制御
function showLoading(show) {
    const loading = document.getElementById('loading');
    loading.style.display = show ? 'block' : 'none';
}

// エラー表示
function showError(message, error) {
    const errorPanel = document.getElementById('error-panel');
    const errorMessage = document.getElementById('error-message');
    
    errorMessage.textContent = message;
    errorPanel.style.display = 'block';
    
    console.error('Error:', error);
}

// イベントリスナーの設定
function setupEventListeners() {
    // コントロール
    document.getElementById('rotation-speed').addEventListener('input', (e) => {
        rotationSpeed = parseFloat(e.target.value);
    });

    document.getElementById('zoom').addEventListener('input', (e) => {
        const distance = parseFloat(e.target.value);
        const direction = camera.position.clone().normalize();
        camera.position.copy(direction.multiplyScalar(distance));
    });

    document.getElementById('light-intensity').addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        directionalLight.intensity = intensity;
    });

    document.getElementById('ambient-light').addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        ambientLight.intensity = intensity;
    });

    // ボタン
    document.getElementById('reset-position').addEventListener('click', resetCameraPosition);
    
    document.getElementById('auto-rotate').addEventListener('click', (e) => {
        autoRotate = !autoRotate;
        controls.autoRotate = autoRotate;
        e.target.classList.toggle('active', autoRotate);
    });

    document.getElementById('close-error').addEventListener('click', () => {
        document.getElementById('error-panel').style.display = 'none';
    });

    // ウィンドウリサイズ
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);

    // コントロールの更新
    controls.update();

    // アニメーションミキサーの更新
    if (currentMixer) {
        currentMixer.update(0.016); // 60FPS想定
    }

    // 手動回転
    if (currentMesh && !autoRotate && rotationSpeed > 0) {
        currentMesh.rotation.y += 0.01 * rotationSpeed;
    }

    renderer.render(scene, camera);
}

// 初期化実行
document.addEventListener('DOMContentLoaded', init);