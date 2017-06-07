// holographic imports
import { HolographicEffect, HolographicCamera } from 'three-holographic';

// three.js imports
import { WebGLRenderer, Scene, PerspectiveCamera, Raycaster, Clock, Color, Vector3, TextureLoader, MeshStandardMaterial, MeshLambertMaterial, MeshBasicMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshPhysicalMaterial, ShaderMaterial, RawShaderMaterial, VertexColors, DataTexture, AmbientLight, DirectionalLight, PointLight, BoxBufferGeometry, SphereBufferGeometry, ConeBufferGeometry, TetrahedronBufferGeometry, TorusKnotBufferGeometry, RingBufferGeometry, DodecahedronGeometry, CylinderGeometry, RGBFormat, Mesh, BufferAttribute } from 'three';

// shaders/textures
import texture from '../res/texture.png';
import basicVertShader from './shaders/vert-basic.vert';
import basicFragShader from './shaders/frag-basic.frag';
import rawVertShader from './shaders/vert-raw.vert';
import rawFragShader from './shaders/frag-raw.frag';

// create canvas
let canvas = document.createElement(window.experimentalHolographic ? 'canvas3D' : 'canvas');
if (!window.experimentalHolographic) {
    document.body.appendChild(canvas);
    document.body.style.margin = document.body.style.padding = 0;
    canvas.style.width = canvas.style.height = "100%";
}

// basics
let renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
let holoEffect = new HolographicEffect(renderer);
let scene = new Scene();
let camera = window.experimentalHolographic ? new HolographicCamera() : new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
let raycaster = new Raycaster();
let clock = new Clock();
let loader = new TextureLoader();

// lighting
let ambientLight = new AmbientLight(0xFFFFFF, 0.5);
let directionalLight = new DirectionalLight(0xFFFFFF, 0.5);
let pointLight = new PointLight(0xFFFFFF, 0.5);

// objects
let cube = new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2), new MeshLambertMaterial({ vertexColors: VertexColors }));
let sphere = new Mesh(new SphereBufferGeometry(0.1, 10, 10), new MeshPhongMaterial({ color: 0xff0000, shininess: 200 }));
let cone = new Mesh(new ConeBufferGeometry(0.1, 0.2, 10, 10), new MeshNormalMaterial());
let torus = new Mesh(new TorusKnotBufferGeometry(0.2, 0.02, 50, 50), new MeshPhysicalMaterial({ color: 0x00ff00, roughness: 0.5, metalness: 1.0 }));
let cursor = new Mesh(new RingBufferGeometry(0.001, 0.003, 20, 20), new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5, depthTest: false }));
let dodecahedron = new Mesh(new DodecahedronGeometry(0.05), new ShaderMaterial({ vertexShader: basicVertShader, fragmentShader: basicFragShader, uniforms: { color: { value: new Color(0x00ffff) } } }));
let cylinder = new Mesh(new CylinderGeometry(0.05, 0.05, 0.1, 20), new RawShaderMaterial({ vertexShader: rawVertShader, fragmentShader: rawFragShader, uniforms: { color: { value: new Color(0x0000ff) } } }));
let tetrahedron = new Mesh(new TetrahedronBufferGeometry(0.15), new MeshStandardMaterial({ color: 0xffff00 }));

// initialisation
renderer.setSize(window.innerWidth, window.innerHeight);
loader.setCrossOrigin('anonymous');
directionalLight.position.set(0, 1, 1);
cube.position.set(0, 0, -1.5);
cube.geometry.addAttribute('color', new BufferAttribute(Float32Array.from([1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, /* right - red */ 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, /* left - blue */ 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, /* top - green */ 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, /* bottom - yellow */ 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, /* back - cyan */ 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 /* front - purple */]), 3));
sphere.position.set(0.4, 0, -1.5);
cone.position.set(-0.4, 0, -1.5);
torus.scale.set(1.5, 1.5, 1.5);
cylinder.position.set(-0.2, 0.3, -1.2);
dodecahedron.position.set(0.2, 0.3, -1.2);
tetrahedron.position.set(0, 0, 3.5);

// scene setup
camera.add(cursor);
scene.add(ambientLight, directionalLight, pointLight, cube, sphere, cone, torus, cylinder, dodecahedron, tetrahedron, camera);

// load textures
loader.load(texture, tex => { cube.material.map = tex; start(); }, x => x, err => start());

function update (delta, elapsed) {
    window.requestAnimationFrame(() => update(clock.getDelta(), clock.getElapsedTime()));

    // animate moving objects
    pointLight.position.set(0 + 2.0 * Math.cos(elapsed * 0.5), 0, -1.5 + 2.0 * Math.sin(elapsed * 0.5));
    cube.rotation.y += 0.01;
    sphere.scale.x = sphere.scale.y = sphere.scale.z = Math.abs(Math.cos(elapsed * 0.3)) * 0.6 + 1.0;
    cone.position.y = Math.sin(elapsed * 0.5) * 0.1;
    torus.position.z = -2 - Math.abs(Math.cos(elapsed * 0.2));
    tetrahedron.rotation.x += 0.01;
    tetrahedron.rotation.y += 0.01;

    // raycasting
    raycaster.ray.origin.setFromMatrixPosition(camera.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        cursor.material.color.set(0xFFFF00);
        cursor.material.opacity = 0.8;
        cursor.scale.set(5, 5, 5);
        cursor.position.setZ(-(intersects[0].distance - 0.01));
        let direction = intersects[0].face.normal.clone().transformDirection(intersects[0].object.matrixWorld);
        cursor.lookAt(direction);
    }
    else {
        cursor.material.color.set(0xFFFFFF);
        cursor.material.opacity = 0.5;
        cursor.scale.set(5, 5, 5);
        cursor.position.setZ(-2);
        cursor.lookAt(new Vector3(0, 0, 1));
    }

    holoEffect.render(scene, camera);
}

function start () {
    update(clock.getDelta(), clock.getElapsedTime());
}