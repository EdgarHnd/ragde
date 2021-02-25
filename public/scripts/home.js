import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';

var camera, scene, renderer, raycaster, mouse;
var one;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 600);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const loader = new THREE.FontLoader();
    loader.load('fonts/helvet.typeface.json', function(font) {

        const color = 0x000000;

        const matDark = new THREE.LineBasicMaterial({
            color: color,
            side: THREE.DoubleSide
        });

        const matLite = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });

        const message = "Ragde";

        const shapes = font.generateShapes(message, 100);

        const geometry = new THREE.ShapeGeometry(shapes);

        geometry.computeBoundingBox();

        const xMid = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

        geometry.translate(xMid, 0, 0);

        // make shape ( N.B. edge view not visible )

        const text = new THREE.Mesh(geometry, matDark);
        text.position.z = -150;
        scene.add(text);

        /* // make line shape ( N.B. edge view remains visible )

        const holeShapes = [];

        for (let i = 0; i < shapes.length; i++) {

            const shape = shapes[i];

            if (shape.holes && shape.holes.length > 0) {

                for (let j = 0; j < shape.holes.length; j++) {

                    const hole = shape.holes[j];
                    holeShapes.push(hole);

                }

            }

        }

        shapes.push.apply(shapes, holeShapes);

        const lineText = new THREE.Object3D();

        for (let i = 0; i < shapes.length; i++) {

            const shape = shapes[i];

            const points = shape.getPoints();
            const geometry = new THREE.BufferGeometry().setFromPoints(points);

            geometry.translate(xMid, 0, 0);

            const lineMesh = new THREE.Line(geometry, matDark);
            lineText.add(lineMesh);

        }

        scene.add(lineText); */

    }); //end load function

    var geometry = new THREE.CubeGeometry(30, 30, 30);
    one = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.5
    }));
    one.position.set(-250, 0, -100);
    one.userData = { URL: "/one" };
    scene.add(one);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();


    /* const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update(); */

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove);
} // end init

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {
    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;

    camera.lookAt(scene.position);
    renderer.render(scene, camera);

}

function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / 1;
    mouseY = (event.clientY - windowHalfY) / 1;

}

function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        if (intersects[0].object.userData.URL != null) {
            window.open(intersects[0].object.userData.URL, "_self");
        }
    }
}