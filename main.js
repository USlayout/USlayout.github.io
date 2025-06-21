import * as THREE from "three";

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#three-canvas")
});

const width =960;
const height = 540;
renderer.setSize(width, height);

renderer.setPixelRatio(devicePixelRatio);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    width / height,
    1,
    10000
);

camera.position.set(0, 0, 1000);