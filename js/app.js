import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let camera, composer, renderer;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const smoothingFactor = 0.03; // Suavidad del movimiento

const params = {
    threshold: 1,
    strength: 0.18,
    radius: 0,
    exposure: 0.4237
};

init();

async function init() {
    const container = document.getElementById('container');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(-6, 6, 6);
    camera.lookAt(0, 4.5, 0);
    scene.add(camera);

    let lightText = new THREE.PointLight(0xc776ff, 20);
    lightText.position.set(0, 6, 12);
    lightText.castShadow = true;
    scene.add(lightText);

    const effectFilm = new FilmPass(0.9);
    const gammaCorrection = new ShaderPass(GammaCorrectionShader);

    const pointLight = new THREE.PointLight(0xc776ff, 10);
    pointLight.position.set(0, 10, 0);
    camera.add(pointLight);

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('../models/3D/scene.gltf');

    const model = gltf.scene;
    scene.add(model);

    // Texto
    const fontLoader = new FontLoader();
    fontLoader.load('./Fonts/NauSeaTitle.json', (font) => {
        const textGeometry = new TextGeometry('Deal Buy', {
            font: font,
            size: 1, 
            depth: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });

        const textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 1,
            roughness: 1,
        });

        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-3, 4, 0);
        textMesh.rotation.set(0, Math.PI / 4, 0);
        textMesh.castShadow = true;
        textMesh.material = textMaterial;

        scene.add(textMesh);
    });

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.domElement.style.position = "fixed"; 
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "-1"; // Lo manda al fondo

    //Deshabilitar Clicks del modelo
    renderer.domElement.style.pointerEvents = "none";

    //Se agrega al container
    model_container.appendChild(renderer.domElement);

    // Post-processing
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.threshold;
    bloomPass.strength = params.strength;
    bloomPass.radius = params.radius;
    bloomPass.exposure = params.exposure;

    const outputPass = new OutputPass();

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    composer.addPass(effectFilm);
    composer.addPass(gammaCorrection);

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
}

function onMouseMove(event) {
    const windowX = window.innerWidth / 2;
    const windowY = window.innerHeight / 2;

    mouseX = (event.clientX - windowX) / windowX;
    mouseY = (event.clientY - windowY) / windowY;
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
}

function animate() {
    // Interpolación para movimiento suave
    targetX += (mouseX - targetX) * smoothingFactor;
    targetY += (mouseY - targetY) * smoothingFactor;

    // Mover la cámara en los ejes X e Y
    camera.position.x = 5 + targetX * 3; 
    camera.position.y = 5 + targetY * 3;
    camera.position.z = 6; // Mantener la distancia en Z

    camera.lookAt(-1, 4.5, -1); // Mantener la vista fija en el centro

    composer.render();
}
