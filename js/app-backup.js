import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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




let camera, stats;
let composer, renderer;

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

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 4.5, 0);
    scene.add(camera);

    let lightText = new THREE.PointLight(0xc776ff, 20);
    lightText.position.set(0, 6, 12);
    lightText.castShadow = true;
    scene.add(lightText);

    //scene.add(new THREE.AmbientLight(0x3f3242));

    const effectFilm = new FilmPass( 0.9 );
    const gammaCorrection = new ShaderPass( GammaCorrectionShader );

    const pointLight = new THREE.PointLight(0xc776ff, 10);
    pointLight.position.set(0, 10, 0);
    camera.add(pointLight);

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('/scene.gltf');

    const model = gltf.scene;
    scene.add(model);

    //HDR LOADER


    //Texto

    const fontLoader = new FontLoader();
    fontLoader.load('/Fonts/NauSeaTitle.json', (font) => {
    
    // Crear la geometría del texto
    const textGeometry = new TextGeometry('Deal Buy', {
        font: font,
        size: 1, // Tamaño del texto
        depth: 0.1, // Ajustar la profundidad de extrusión
        curveSegments: 12, // Suavidad de las curvas
        bevelEnabled: true, // Activar biselado
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });

    // Crear el material reflectante
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,     // Color blanco
        metalness: 1,       // 100% metálico (mayor reflejo)
        roughness: 1,       // 0 para que sea brillante
    });
    

    // Crear el mesh del texto
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-3, 4, 0); // Posición del texto en la escena
    textMesh.rotation.set(0, Math.PI / 4, 0); // Rotar 45° en Y
    textMesh.castShadow = true;
    textMesh.material = textMaterial;

    scene.add(textMesh);
});


    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild(renderer.domElement);

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


    // Orbit Controls
    // GUI Controls
    

    window.addEventListener('resize', onWindowResize);

    mouseX = 0;
    mouseY = 0;
    targetX = 0;
    targetY = 0;

    // Detectar movimiento del mouse
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

    composer.render();
}
