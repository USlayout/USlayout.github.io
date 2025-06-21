import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';

// showModelPreview関数をグローバルに定義
window.showModelPreview = function(imgElement) {
    imgElement.style.display = 'none';
    const previewContainer = imgElement.nextElementSibling;
    previewContainer.style.display = 'block';
    
    // 3Dシーンの初期化
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1, 3);

    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(previewContainer.offsetWidth, previewContainer.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    previewContainer.appendChild(renderer.domElement);

    // 光源の設定
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 2, 3);
    scene.add(directionalLight);

    // モデル読み込み
    const loader = new GLTFLoader();
    loader.load('model/test.glb', (gltf) => {
        const model = gltf.scene;
        
        // モデルのサイズ調整
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        model.scale.setScalar(scale);
        
        model.position.sub(center.multiplyScalar(scale));
        
        scene.add(model);
    }, undefined, (error) => {
        console.error('モデル読み込みエラー:', error);
        // フォールバック表示
        previewContainer.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#666;">3Dモデル読み込み中...</div>';
    });

    // カメラ操作
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2;

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // リサイズ対応
    const resizeObserver = new ResizeObserver(() => {
        const width = previewContainer.offsetWidth;
        const height = previewContainer.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
    resizeObserver.observe(previewContainer);
};