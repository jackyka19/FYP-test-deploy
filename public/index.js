import * as THREE from '/build/three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
import {OrbitControls} from './jsm/controls/OrbitControls.js';
import {GUI} from './jsm/libs/lil-gui.module.min.js';
import Stats from './jsm/libs/stats.module.js';

// create a THREE.JS Scene
const scene = new THREE.Scene();

// create a new camera with positions and angle
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
const gui = new GUI();
gui.domElement.style.display = 'block'; // Hide the GUI by default
gui.close(); // Close the GUI by default
const statsControl = { showStats: false };
    gui.add(statsControl, "showStats").name("Show Stats").onChange((value) => {
        stats.domElement.style.display = value ? 'block' : 'none'; // Show or hide stats
    });

camera.position.set(0, 0, 10); // 設置相機位置

const stats = new Stats();
document.body.appendChild(stats.domElement);
stats.domElement.style.display = 'none'; // Hide stats by default

let object;
let controls;
let objToRender = "example";
let input_model;

const loader = new GLTFLoader();

let isAnimating = false; // 用於控制動畫狀態
const duration = 5000; // 動畫持續時間，單位為毫秒
let startTime = null; // 紀錄動畫開始時間
let initialPosition; // 紀錄初始位置

//Load the file 
loader.load(
            './model/scene.glb',
            (gltf) => {
                

                input_model = gltf.scene.children[0];
                input_model.position.set(0, -1, 0);
                input_model.scale.set(0.1, 0.1, 0.1); // 將模型縮放到原來的15%
                input_model.rotation.x = Math.PI / -3;
                scene.add(gltf.scene);

                // 紀錄初始位置
        initialPosition = input_model.position.clone();
        
        // 開始動畫
        isAnimating = true;
        startTime = Date.now();
        animate(); // 開始動畫循環

    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha:true });
renderer.setSize(window.innerWidth*0.8, window.innerHeight*0.8);

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

controls = new OrbitControls(camera, renderer.domElement);

// camera.position.z = example === "example" ? 25 : 500;

const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color,intensity)
topLight.position.set(200,200,200); // top-left-ish
// topLight.castShadow = true;
scene.add(topLight);

// const ambientLight = new THREE.AmbientLight(0xffffff, 10); // 將強度設置為 10
const ambientLight = new THREE.AmbientLight(0xffffff, 5); 
scene.add(ambientLight);

let step = 0;



function animate(){
    requestAnimationFrame(animate);

    // const elapsedTime = Date.now() - startTime; // 計算經過的時間

    if (isAnimating) {
        const elapsedTime = Date.now() - startTime; // 計算經過的時間
        const progress = Math.min(elapsedTime / duration, 1); // 計算運動比例
        
        // 更新模型位置和旋轉
        input_model.position.y = initialPosition.y + Math.abs(Math.sin(progress * Math.PI * 2)) / 2; // 使模型上下移動
        input_model.rotation.y = Math.sin(progress * Math.PI * 2) * Math.abs(Math.cos(progress * Math.PI * 2 / 3) / 4); // 使模型旋轉

        // 當經過時間達到持續時間時，停止動畫
        if (progress === 1) {
            isAnimating = false; // 停止動畫
            input_model.position.copy(initialPosition); // 回到初始位置
        }
    }

    stats.update();
    
    renderer.render(scene, camera);
    

}

window.addEventListener("resize", function(){
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(this.window.innerWidth*0.8, this.window.innerHeight*0.8);
});

// Start the 3D rendering
animate();