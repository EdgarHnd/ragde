import * as THREE from '/build/three.module.js';
import { GLTFLoader } from '/jsm/loaders/GLTFLoader.js';

const SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight,

    r = 450;

let
    camera, scene, renderer;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const mixers = [];
const clock = new THREE.Clock();

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(2, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 3000);
    camera.position.set(0, 1000, 0);


    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);


    scene.add(new THREE.AmbientLight(0xffffff));
    //Add directional light
    /* let dirLight = new THREE.DirectionalLight(0xffffff, 10);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-100, 1.75, 1);
    dirLight.position.multiplyScalar(100);
    scene.add(dirLight); */


    // MODEL

    const loader = new GLTFLoader();

    loader.load('models/three.gltf', function(gltf) {

        const mesh = gltf.scene;

        const s = 10;
        mesh.scale.set(s, s, s);
        mesh.rotation.x = Math.PI;

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);

        const mixer = new THREE.AnimationMixer(mesh);
        for (let i = 0; i < gltf.scene.children.length; i++) {
            mixer.clipAction(gltf.animations[i]).setDuration(2000 * (Math.floor(Math.random() * 10) + 1)).play();
            mixers.push(mixer);
        }



    });



    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    document.body.appendChild(renderer.domElement);

    document.body.style.touchAction = 'none';


    //

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onDocumentMouseMove);
}


function onWindowResize() {

    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}



function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {

    const delta = clock.getDelta();

    for (let i = 0; i < mixers.length; i++) {

        mixers[i].update(delta);

    }


    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;
    camera.position.z = 1000;



    camera.lookAt(scene.position);
    renderer.render(scene, camera);


}

function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2 - 1000;

}