import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { AmmoPhysics } from '/jsm/physics/AmmoPhysics.js';
import Stats from '/jsm/libs/stats.module.js';

//variable declaration section
let physicsWorld, scene, camera, renderer, rigidBodies = [],
    clock, tmpTrans = null
let boxeObject = null,
    moveDirection = { left: 0, right: 0, forward: 0, back: 0 }
let tmpPos = new THREE.Vector3(),
    tmpQuat = new THREE.Quaternion();
let ammoTmpPos = null,
    ammoTmpQuat = null;

const STATE = { DISABLE_DEACTIVATION: 4 }

const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

//Ammojs Initialization
Ammo().then(start)

function start() {

    tmpTrans = new Ammo.btTransform();
    ammoTmpPos = new Ammo.btVector3();
    ammoTmpQuat = new Ammo.btQuaternion();

    setupPhysicsWorld();

    setupGraphics();
    createBlock();
    createWall1();
    createWall2();
    createWall3();
    createWall4();
    createBox();

    setupEventHandlers();
    renderFrame();

}

function setupPhysicsWorld() {

    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -100, 0));

}


function setupGraphics() {

    //create clock for timing
    clock = new THREE.Clock();

    //create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    //create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-90, 90, 90);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //Add hemisphere light
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
    hemiLight.color.setHSL(0.6, 0.6, 0.6);
    hemiLight.groundColor.setHSL(0.1, 1, 0.4);
    hemiLight.position.set(0, 50, 0);
    /* scene.add(hemiLight); */

    //Add directional light
    let dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-100, 1.75, 1);
    dirLight.position.multiplyScalar(100);
    scene.add(dirLight);

    //Add directional light 2
    let dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight2.color.setHSL(0.1, 1, 0.95);
    dirLight2.position.set(0, 1.75, 100);
    dirLight2.position.multiplyScalar(100);
    scene.add(dirLight2);

    //Setup the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;

    /*  const controls = new OrbitControls(camera, renderer.domElement);
     controls.target.y = 0.5;
     controls.update(); */

}


function renderFrame() {

    let deltaTime = clock.getDelta();

    moveBoxe();

    updatePhysics(deltaTime);

    renderer.render(scene, camera);

    requestAnimationFrame(renderFrame);

}

function setupEventHandlers() {

    window.addEventListener('keydown', handleKeyDown, false);
    window.addEventListener('keyup', handleKeyUp, false);

}


function handleKeyDown(event) {

    let keyCode = event.keyCode;

    switch (keyCode) {

        case 87: //W: FORWARD
            moveDirection.forward = 1
            break;

        case 83: //S: BACK
            moveDirection.back = 1
            break;

        case 65: //A: LEFT
            moveDirection.left = 1
            break;

        case 68: //D: RIGHT
            moveDirection.right = 1
            break;

        case 38: //↑: FORWARD
            moveDirection.forward = 1
            break;

        case 40: //↓: BACK
            moveDirection.back = 1
            break;

        case 37: //←: LEFT
            moveDirection.left = 1
            break;

        case 39: //→: RIGHT
            moveDirection.right = 1
            break;

    }
}


function handleKeyUp(event) {
    let keyCode = event.keyCode;

    switch (keyCode) {
        case 87: //FORWARD
            moveDirection.forward = 0
            break;

        case 83: //BACK
            moveDirection.back = 0
            break;

        case 65: //LEFT
            moveDirection.left = 0
            break;

        case 68: //RIGHT
            moveDirection.right = 0
            break;

        case 38: //↑: FORWARD
            moveDirection.forward = 0
            break;

        case 40: //↓: BACK
            moveDirection.back = 0
            break;

        case 37: //←: LEFT
            moveDirection.left = 0
            break;

        case 39: //→: RIGHT
            moveDirection.right = 0
            break;
    }

}



function createBlock() {

    let pos = { x: 0, y: 0, z: 0 };
    let scale = { x: 100, y: 2, z: 100 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({ color: 0x000000 }));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;


    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody(body);
}

function createWall1() {

    let pos = { x: 0, y: 49, z: -50 };
    let scale = { x: 100, y: 100, z: 2 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x000000 }));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.receiveShadow = false;


    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody(body);
}

function createWall2() {

    let pos = { x: 50, y: 49, z: 0 };
    let scale = { x: 2, y: 100, z: 100 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x000000 }));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.receiveShadow = false;


    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody(body);
}

function createWall3() {

    let pos = { x: 0, y: 50, z: 50 };
    let scale = { x: 100, y: 100, z: 2 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody(body);
}

function createWall4() {

    let pos = { x: -50, y: 50, z: 0 };
    let scale = { x: 2, y: 100, z: 100 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    physicsWorld.addRigidBody(body);
}

function createBox() {

    let pos = { x: 0, y: 4, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 10000;
    let scale = { x: 10, y: 10, z: 10 };

    //threeJS Section
    let boxe = boxeObject = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({ color: 0xffffff }));

    boxe.position.set(pos.x, pos.y, pos.z);
    boxe.scale.set(scale.x, scale.y, scale.z);

    boxe.castShadow = true;
    boxe.receiveShadow = true;

    scene.add(boxe);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    let motionState = new Ammo.btDefaultMotionState(transform);

    let colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5));
    colShape.setMargin(0.05);

    let localInertia = new Ammo.btVector3(1, 1, 1);
    colShape.calculateLocalInertia(mass, localInertia);

    let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
    let body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(4);
    body.setRollingFriction(10);

    body.setActivationState(STATE.DISABLE_DEACTIVATION)


    physicsWorld.addRigidBody(body);

    boxe.userData.physicsBody = body;
    rigidBodies.push(boxe);
}

function moveBoxe() {

    let scalingFactor = 15;

    let moveX = moveDirection.right - moveDirection.left;
    let moveZ = moveDirection.back - moveDirection.forward;
    let moveY = 0;

    if (moveX == 0 && moveY == 0 && moveZ == 0) return;

    let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ)
    resultantImpulse.op_mul(scalingFactor);

    let physicsBody = boxeObject.userData.physicsBody;
    physicsBody.setLinearVelocity(resultantImpulse);

}

function onWindowResize() {
    // Camera frustum aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    // After making changes to aspect
    camera.updateProjectionMatrix();
    // Reset size
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);



function updatePhysics(deltaTime) {

    // Step world
    physicsWorld.stepSimulation(deltaTime, 10);

    // Update rigid bodies
    for (let i = 0; i < rigidBodies.length; i++) {
        let objThree = rigidBodies[i];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if (ms) {

            ms.getWorldTransform(tmpTrans);
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set(p.x(), p.y(), p.z());
            objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

        }
    }

}