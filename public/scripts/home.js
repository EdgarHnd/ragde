import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';

var camera, scene, renderer, raycaster, mouse, text;
var one, two, three;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var pivotPoint;
init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 0, 600);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
    scene.add(hemiLight);
    //Add directional light
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight.position.set(0, 0, -150);
    dirLight.position.multiplyScalar(100);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x404040));

    // Fog
    scene.fog = new THREE.Fog(0x23272a, 0.5, 1700, 4000);

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

        text = new THREE.Mesh(geometry, matDark);
        text.position.z = -150;
        scene.add(text);
    }); //end load function

    //One
    var cube = new THREE.CubeGeometry(30, 30, 30);
    one = new THREE.Mesh(cube, new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.5
    }));
    one.position.set(-250, 0, 0);
    one.userData = { URL: "/one" };
    scene.add(one);

    // Pivot point
    pivotPoint = new THREE.Object3D();
    var pnt = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0
    }));
    pnt.position.set(0, 0, -150);
    pnt.rotation.set(0, 0, -0.7);
    pnt.add(pivotPoint);
    scene.add(pnt);
    //Two
    var sphere = new THREE.SphereGeometry(30, 30, 30);
    two = new THREE.Mesh(sphere, new THREE.MeshToonMaterial({
        color: "rgb(255,182,193)",
        opacity: 1
    }));
    two.position.set(0, 135, -150);
    two.userData = { URL: "/two" };
    scene.add(two);
    /*  pivotPoint.add(two); */

    var circle = new THREE.RingGeometry(120, 125, 64);

    var loop = new THREE.Mesh(circle, new THREE.MeshBasicMaterial({ color: 0x000000 }));
    loop.position.set(80, 50, -150);
    loop.rotation.set(1, -0.7, 0.7)
    scene.add(loop);

    //three
    const cyl = new THREE.CylinderGeometry(10, 10, 50, 32);
    three = new THREE.Mesh(cyl, new THREE.MeshBasicMaterial({
        color: "rgb(54, 255, 231)",
    }));
    three.position.set(250, 0, 0);
    three.userData = { URL: "/three" };
    scene.add(three);


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
    /* const timer = Date.now() * 0.0005;
    two.position.x = Math.sin(timer * 3) * 200;
    two.position.y = Math.cos(timer * 1) * 10;
    two.position.z = Math.sin(timer * 8) * -100; */
    /*  pivotPoint.rotation.y += 0.025; */


    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;



    camera.lookAt(scene.position);
    renderer.render(scene, camera);

}

function onDocumentMouseMove(event) {

    mouseX = (event.clientX - windowHalfX) / 2;
    mouseY = (event.clientY - windowHalfY) / 2;

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