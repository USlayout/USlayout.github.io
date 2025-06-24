// Three.js の基本要素
let scene, camera, renderer;
let currentModel = null;
let ambientLight, directionalLight;
let isAutoRotating = false;

// ポートフォリオ作品データ
const portfolioModels = [
    {
        id: 'test1',
        name: 'test1',
        description: '3DCGで制作したオリジナルロボットキャラクター。Blenderで作成し、リギング・アニメーション対応。',
        path: 'model/test.glb'
    },
    {
        id: 'test2',
        name: 'test2',
        description: 'SF映画をイメージした近未来的な建物のモデル。ライティングとマテリアルに特にこだわりました。',
        path: 'model/test2.glb'
    },
];

// 初期化
function init() {
    // シーンの作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2c2c2c);

    // カメラの作成
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 5);

    // レンダラーの作成
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('container').appendChild(renderer.domElement);

    // ライトの設定
    setupLights();

    // コントロールの設定
    setupControls();

    // イベントリスナーの設定
    setupEventListeners();

    // デフォルトオブジェクトの追加（キューブ）
    addDefaultObject();

    // アニメーションループの開始
    animate();
}

// ライトの設定
function setupLights() {
    // 環境光
    ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    // 指向性ライト
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 補助ライト
    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-5, 3, -5);
    scene.add(light2);
}

// マウスコントロールの設定（OrbitControlsの代替実装）
function setupControls() {
    let isMouseDown = false;
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let rotationX = 0, rotationY = 0;
    let isRightClick = false;

    const canvas = renderer.domElement;

    canvas.addEventListener('mousedown', (event) => {
        isMouseDown = true;
        isRightClick = event.button === 2;
        mouseX = event.clientX;
        mouseY = event.clientY;
        event.preventDefault();
    });

    canvas.addEventListener('mousemove', (event) => {
        if (!isMouseDown) return;

        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;

        if (isRightClick) {
            // パン（移動）
            const panSpeed = 0.01;
            camera.position.x -= deltaX * panSpeed;
            camera.position.y += deltaY * panSpeed;
        } else {
            // 回転
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
        }

        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        isRightClick = false;
    });

    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // ズーム
    canvas.addEventListener('wheel', (event) => {
        const zoomSpeed = 0.1;
        const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        
        if (event.deltaY > 0 && distance < 50) {
            camera.position.multiplyScalar(1 + zoomSpeed);
        } else if (event.deltaY < 0 && distance > 1) {
            camera.position.multiplyScalar(1 - zoomSpeed);
        }
        event.preventDefault();
    });

    // スムーズな回転更新
    function updateRotation() {
        rotationX += (targetRotationX - rotationX) * 0.1;
        rotationY += (targetRotationY - rotationY) * 0.1;

        const radius = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        camera.position.x = radius * Math.sin(rotationY) * Math.cos(rotationX);
        camera.position.y = radius * Math.sin(rotationX);
        camera.position.z = radius * Math.cos(rotationY) * Math.cos(rotationX);
        camera.lookAt(0, 0, 0);

        requestAnimationFrame(updateRotation);
    }
    updateRotation();
}

// イベントリスナーの設定
function setupEventListeners() {
    // モデル選択
    const modelSelect = document.getElementById('model-select');
    
    // ポートフォリオモデルをセレクトボックスに追加
    portfolioModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });
    
    modelSelect.addEventListener('change', handleModelSelect);

    // ファイル入力
    document.getElementById('file-input').addEventListener('change', handleFileLoad);

    // カメラリセット
    document.getElementById('reset-camera').addEventListener('click', resetCamera);

    // ワイヤーフレーム切り替え
    document.getElementById('toggle-wireframe').addEventListener('click', toggleWireframe);
    
    // 自動回転切り替え
    document.getElementById('auto-rotate').addEventListener('click', toggleAutoRotate);

    // ライト強度調整
    document.getElementById('light-intensity').addEventListener('input', (e) => {
        const intensity = parseFloat(e.target.value);
        directionalLight.intensity = intensity;
    });

    // ウィンドウリサイズ
    window.addEventListener('resize', onWindowResize);
}

// デフォルトオブジェクト（キューブ）の追加
function addDefaultObject() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x4CAF50,
        shininess: 100
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    
    // 床の追加
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    currentModel = cube;
    updateModelInfo('デフォルトキューブ', 'ポートフォリオ作品を選択してください。');
}

// モデル選択処理
function handleModelSelect(event) {
    const selectedId = event.target.value;
    if (!selectedId) {
        // デフォルトオブジェクトを表示
        clearCurrentModel();
        addDefaultObject();
        updateModelInfo('デフォルトキューブ');
        return;
    }
    
    const selectedModel = portfolioModels.find(model => model.id === selectedId);
    if (selectedModel) {
        loadModelFromPath(selectedModel.path);
        updateModelInfo(selectedModel.name, selectedModel.description);
    }
}

// パスからモデルを読み込み
function loadModelFromPath(modelPath) {
    const loading = document.getElementById('loading');
    loading.style.display = 'block';
    
    // GLTFLoaderを使用してモデルを読み込み
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        modelPath,
        function(gltf) {
            // 既存のモデルを削除
            clearCurrentModel();
            
            // 新しいモデルを追加
            currentModel = gltf.scene;
            setupModel(currentModel);
            
            // ローディング非表示
            loading.style.display = 'none';
            
            console.log('Model loaded successfully:', modelPath);
        },
        function(progress) {
            console.log('Loading progress: ', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading model:', error);
            loading.style.display = 'none';
            
            // エラー時はデフォルトオブジェクトを表示
            clearCurrentModel();
            addDefaultObject();
            updateModelInfo('読み込みエラー', 'モデルファイルが見つかりません。デフォルトオブジェクトを表示しています。');
        }
    );
}

// モデル情報更新
function updateModelInfo(title, description) {
    document.getElementById('model-title').textContent = title;
    document.getElementById('model-description').textContent = description;
}

// 現在のモデルをクリア
function clearCurrentModel() {
    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
    
    // デフォルトオブジェクト（キューブ）も削除
    const objectsToRemove = [];
    scene.traverse((child) => {
        if (child.isMesh && child !== currentModel) {
            objectsToRemove.push(child);
        }
    });
    objectsToRemove.forEach(obj => {
        if (obj.parent) {
            obj.parent.remove(obj);
        }
    });
}

// モデルの設定
function setupModel(model) {
    // モデルのスケール調整
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxSize; // 適切なサイズに調整
    model.scale.multiplyScalar(scale);
    
    // モデルを中央に配置
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center.multiplyScalar(scale));
    
    // シャドウの設定
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    scene.add(model);
}

// 自動回転切り替え
function toggleAutoRotate() {
    isAutoRotating = !isAutoRotating;
    const button = document.getElementById('auto-rotate');
    button.textContent = isAutoRotating ? '自動回転停止' : '自動回転';
    button.style.background = isAutoRotating ? '#f44336' : '#4CAF50';
}
function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const loading = document.getElementById('loading');
    loading.style.display = 'block';

    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        loadGLTFModel(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
}

// GLTFモデルの読み込み
/*function loadGLTFModel(arrayBuffer) {
    // GLTFLoaderの代替実装（簡単なOBJローダー的な処理）
    // 実際の実装では THREE.GLTFLoader を使用
    try {
        const loader = new THREE.GLTFLoader();
        
        // ArrayBufferをBlobに変換してオブジェクトURLを作成
        const blob = new Blob([arrayBuffer]);
        const url = URL.createObjectURL(blob);
        
        loader.load(
            url,
            function(gltf) {
                // 既存のモデルを削除
                if (currentModel) {
                    scene.remove(currentModel);
                }
                
                // 新しいモデルを追加
                currentModel = gltf.scene;
                
                // モデルのスケール調整
                const box = new THREE.Box3().setFromObject(currentModel);
                const size = box.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxSize; // 適切なサイズに調整
                currentModel.scale.multiplyScalar(scale);
                
                // モデルを中央に配置
                const center = box.getCenter(new THREE.Vector3());
                currentModel.position.sub(center.multiplyScalar(scale));
                
                // シャドウの設定
                currentModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                
                scene.add(currentModel);
                
                // ローディング非表示
                document.getElementById('loading').style.display = 'none';
                
                // オブジェクトURLを解放
                URL.revokeObjectURL(url);
                
                console.log('Model loaded successfully');
            },
            function(progress) {
                console.log('Loading progress: ', (progress.loaded / progress.total * 100) + '%');
            },
            function(error) {
                console.error('Error loading model:', error);
                document.getElementById('loading').style.display = 'none';
                alert('モデルの読み込みに失敗しました。GLTFまたはGLBファイルを選択してください。');
            }
        );
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('ファイルの読み込みに失敗しました。');
    }
}*/

// カメラリセット
function resetCamera() {
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
}

// ワイヤーフレーム切り替え
function toggleWireframe() {
    if (currentModel) {
        currentModel.traverse((child) => {
            if (child.isMesh) {
                child.material.wireframe = !child.material.wireframe;
            }
        });
    }
}

// ウィンドウリサイズ処理
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    
    // 自動回転
    if (isAutoRotating && currentModel) {
        currentModel.rotation.y += 0.01;
    }
    
    // デフォルトオブジェクト（キューブ）の場合の回転
    if (currentModel && currentModel.geometry && currentModel.geometry.type === 'BoxGeometry' && !isAutoRotating) {
        currentModel.rotation.x += 0.01;
        currentModel.rotation.y += 0.01;
    }
    
    renderer.render(scene, camera);
}

// GLTFLoaderの追加（CDNから読み込み）
function loadGLTFLoader() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/loaders/GLTFLoader.js';
    script.onload = () => {
        console.log('GLTFLoader loaded');
    };
    document.head.appendChild(script);
}

// 初期化実行
window.addEventListener('load', () => {
    loadGLTFLoader();
    init();
});