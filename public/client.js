import * as THREE from '/build/three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
import {OrbitControls} from './jsm/controls/OrbitControls.js';
import {GUI} from './jsm/libs/lil-gui.module.min.js';
import Stats from './jsm/libs/stats.module.js';
import { MeshoptDecoder } from './jsm/libs/meshopt_decoder.module.js'; 
import {OBJLoader} from './jsm/loaders/OBJLoader.js';
import {MTLLoader} from './jsm/loaders/MTLLoader.js';
import {FBXLoader} from './jsm/loaders/FBXLoader.js';
import {RGBELoader} from "./jsm/loaders/RGBELoader.js";
import {STLLoader} from "./jsm/loaders/STLLoader.js";


let scene;
let camera;
let renderer;
let input_model;
let spotLightHelper1; 
let spotLightHelper2; 
let model_container = document.querySelector('.web-gl');
let defaultScale; 
let scaleXControl, scaleYControl, scaleZControl;
let defaultCameraPosition;
let camerapositionControl;

let scaleControl; 


const loadingManager = new THREE.LoadingManager();
// loadingManager.onProgress = function(url, item, total){
//     console.log(`Started loading ${url}`);
// }

// loadingManager.onProgress = function(url, loaded, total){
//     console.log(`Started loading ${url}`);
// }

const progressBar = document.getElementById("progress-bar");


// 新增navbar
const navbar = document.getElementById("navbar");
// Show the navbar initially
navbar.style.display = "block"; // or "block" depending on your CSS


loadingManager.onProgress = function(url, loaded, total){
    progressBar.value = (loaded / total) * 100;
    // Hide the navbar when loading starts
    navbar.style.display = "none";
}

const progressBarContainer = document.querySelector(".progress-bar-container");
loadingManager.onLoad = function(){
    progressBarContainer.style.display = "none"; // Hide progress bar when loading is complete

// Show the navbar again after loading
// navbar.style.display = "block"; // or "block"
navbar.classList.remove('hidden'); // Show the navbar again after loading
}


//------

// Button and file input handling
// const loadModelBtn = document.getElementById('myButton');
// const modelFileInput = document.getElementById('model-file-input');

// Get modal elements
const modal = document.getElementById("uploadModal");
const closeBtn = document.getElementById("closeModal");
const uploadButton = document.getElementById("uploadButton");
const fileInputModal = document.getElementById("model-file-input-modal");

//------


// loadingManager.onLoad = function() {
//     console.log("Just finished loading");
// }

// loadingManager.onError = function(url) {
//     console.error(`Got a problem loading ${url}`);
// }

const stats = new Stats();
document.body.appendChild(stats.domElement);
stats.domElement.style.display = 'none'; // Hide stats by default

let controls;

// 加入背顏色 (2D,3D背景有用)
const params = {
    color: '#000000', // Default background color
    backgroundImage: '' // Default background image URL
};

const init = () => {
    scene = new THREE.Scene();

    // scene.background = new THREE.Color(0x000000); // Set black background
    

    const fov = 40;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    const gui = new GUI();
    gui.domElement.style.display = 'none'; // Hide the GUI by default
    gui.close(); // Close the GUI by default


    camera.position.set(0, 0, 25); //camera.position.set(0, 0, 25);
    scene.add(camera);

    
    // camera_position.add(lightHelperControl1, "showHelpers").name("Show Front Light Helpers").onChange((value) => {
    //     if (value) {
    //         scene.add(spotLightHelper1); // Add front light helper to the scene
    //     } else {
    //         scene.remove(spotLightHelper1); // Remove front light helper from the scene
    //     }
    // });
    // camera_position.add(camera.position, 'x', -1000, 1000, 0.5);
    // camera_position.add(camera.position, 'y', -1000, 1000, 0.5);
    // camera_position.add(camera.position, 'z', -1000, 1000, 0.5);
    const statsControl = { showStats: false };
    gui.add(statsControl, "showStats").name("Show Stats").onChange((value) => {
        stats.domElement.style.display = value ? 'block' : 'none'; // Show or hide stats
    });

    const background_change = gui.addFolder("Background").close();
    // Add a checkbox to control the alpha property of the renderer
    // const alphaControl = { alpha: false }; // Default to false
    // background_change.add(alphaControl, "alpha").name("Alpha (Transparent Background)").onChange((value) => {
    //     // Update the renderer's alpha property
    //     renderer.dispose(); // Dispose the current renderer
    //     renderer = new THREE.WebGLRenderer({ antialias: true, alpha: value, canvas: model_container }); // Reinitialize the renderer
    //     renderer.setSize(window.innerWidth, window.innerHeight);
    //     document.body.appendChild(renderer.domElement); // Append the new renderer to the DOM
    // });
    
    // background color
    background_change.addColor(params, 'color').name('Background Color').onChange((value) => {
        if (!params.backgroundImage) {
            scene.background = new THREE.Color(value); // Update the scene background color
        }
    });

    //Add a text input to set the background image URL
    background_change.add(params, 'backgroundImage').name('Background Image URL').onChange((value) => {
        if (value) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(value, (texture) => {
                scene.background = texture; // Update the scene background to the texture
            });
        }
    });

// Create an input for uploading 2D or 3D images
const uploadInput = document.createElement('input');
uploadInput.type = 'file';
// uploadInput.accept = '.hdr'; // Allow only HDR files
uploadInput.accept = '.hdr,.jpg,.jpeg,.png'; // Allow HDR and 2D image files
uploadInput.style.display = 'none'; // Hide the input
document.body.appendChild(uploadInput);

// Add button to trigger file upload
// gui.add({ upload: () => uploadInput.click() }, 'upload').name('Upload HDR Image');

// Add button to trigger file upload
background_change.add({ upload: () => uploadInput.click() }, 'upload').name('Upload Image');

// Handle the file upload
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        // const rgbeLoader = new RGBELoader();
        reader.onload = (e) => {
            // const blob = new Blob([e.target.result], { type: 'image/hdr' });
            const blob = new Blob([e.target.result], { type: file.type });
            const url = URL.createObjectURL(blob); // Create a Blob URL
            // const rgbeLoader = new THREE.RGBELoader();

              // Clear the previous background
              scene.background = null; // Reset the background

               // Determine file type by extension
            const fileExtension = file.name.split('.').pop().toLowerCase();

// Determine file type and load accordingly
        if (fileExtension === 'hdr'){
            const rgbeLoader = new RGBELoader();
            rgbeLoader.load(url, (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping; // Set mapping for HDR
                scene.background = texture; // Set the uploaded HDR image as background
                params.color = '#ffffff'; // Reset color to white or any default
                URL.revokeObjectURL(url); // Clean up the Blob URL
            });
        } else if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(url, (texture) => {
                scene.background = texture; // Set the new 2D image as background
                params.color = '#ffffff'; // Reset color to white or any default
                URL.revokeObjectURL(url); // Clean up the Blob URL
            });
        } else {
            console.error('Unsupported file type');
        }
    };
        reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    }
});
//___
// texture
const texture_change = gui.addFolder("Texture").close();
// 現在是texture input (這是公用的 即係glb gltf fbx 等等都可以用這個texture)
// Add an input for uploading textures (JPG, PNG)
const textureInput = document.createElement('input');
textureInput.type = 'file';
textureInput.accept = '.jpg,.jpeg,.png'; // Allow only image files
textureInput.style.display = 'none'; // Hide the input
document.body.appendChild(textureInput);

// Add button to trigger texture upload
texture_change.add({ uploadTexture: () => textureInput.click() }, 'uploadTexture').name('Upload Texture');

// Handle texture upload
textureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(URL.createObjectURL(file), (texture) => {
                if (input_model) {
                    // Apply the texture to the model's material
                    input_model.traverse((child) => {
                        if (child.isMesh) {
                            child.material.map = texture; // Apply the texture
                            child.material.needsUpdate = true; // Notify Three.js to update the material
                        }
                    });
                }
            });
        };
        reader.readAsDataURL(file); // Read the file as a Data URL
    }
});
//___


//___
    const camera_position = gui.addFolder("Camera").close();
    // Get the default camera position of the model
    defaultCameraPosition = camera.position.clone();

    camerapositionControl = {
        x: defaultCameraPosition.x,
        y: defaultCameraPosition.y,
        z: defaultCameraPosition.z
    };


    const camerapositionXControl = camera_position.add(camerapositionControl, 'x', -300, 300, 0.5).name(`x`);
    const camerapositionYControl = camera_position.add(camerapositionControl, 'y', -300, 300, 0.5).name(`y`);
    const camerapositionZControl = camera_position.add(camerapositionControl, 'z', -300, 300, 0.5).name(`z`);


    camerapositionXControl.onChange((value) => {
    camera.position.set(value, camera.position.y, camera.position.z);
    camerapositionXControl.updateDisplay(); // Update the GUI display
    });

    camerapositionYControl.onChange((value) => {
    camera.position.set(camera.position.x, value, camera.position.z);
    camerapositionXControl.updateDisplay(); // Update the GUI display
    });

    camerapositionZControl.onChange((value) => {
    camera.position.set(camera.position.x, camera.position.y, value);
    camerapositionZControl.updateDisplay(); // Update the GUI display
    });

    camera_position.add({ resetPosition: () => {
    camera.position.copy(defaultCameraPosition); // Reset the model scale to default
    camerapositionXControl.setValue(defaultCameraPosition.x); // Update GUI control
    camerapositionXControl.updateDisplay(); // Update the GUI display
    camerapositionYControl.setValue(defaultCameraPosition.y); // Update GUI control
    camerapositionYControl.updateDisplay(); // Update the GUI display
    camerapositionZControl.setValue(defaultCameraPosition.z); // Update GUI control
    camerapositionZControl.updateDisplay(); // Update the GUI display
    console.log("Scale reset to default:", defaultCameraPosition );
    }}, 'resetPosition').name('Reset Position');

    renderer = new THREE.WebGLRenderer({
        antialias: true, 
        alpha: false,
        canvas: model_container
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    
    controls.autoRotate = false; // Initially set to false
    controls.autoRotateSpeed = 5.0; // Set the speed of auto-rotation

    const ambientLight = new THREE.AmbientLight(0xffffff, 5); 
    scene.add(ambientLight);

    // Create a folder for ambient light controls
    const ambientLightFolder = gui.addFolder("Ambient Light").close();

    const DEFAULT_INTENSITY = 5;
    const DEFAULT_COLOR = '#ffffff';
    
    // Create control object
    const ambientLightControls = {
        intensity: DEFAULT_INTENSITY,
        color: DEFAULT_COLOR,
        isEnabled: true, // 初始狀態為開啟
        reset: function() {
            ambientLight.intensity = DEFAULT_INTENSITY;
            intensityController.setValue(DEFAULT_INTENSITY);
            intensityController.updateDisplay();
        },
        resetColor: function() {
            ambientLight.color.set(DEFAULT_COLOR);
            colorController.setValue(DEFAULT_COLOR);
            colorController.updateDisplay();
        }
    };

    // Store controller references
    const intensityController = ambientLightFolder.add(ambientLightControls, 'intensity', 0, 30, 0.1)
        .name('Intensity')
        .onChange((value) => {
            ambientLight.intensity = value;
        });

    const colorController = ambientLightFolder.addColor(ambientLightControls, 'color')
        .name('Color')
        .onChange((value) => {
            ambientLight.color.set(value);
        });

        // Add checkbox to control Ambient Light
ambientLightFolder.add(ambientLightControls, 'isEnabled').name('Ambient Light').onChange((value) => {
    ambientLight.visible = value; // 控制燈光的可見性
});

    // Add reset button
    ambientLightFolder.add(ambientLightControls, 'reset').name('Reset Intensity');
    ambientLightFolder.add(ambientLightControls, 'resetColor').name('Reset Color');


    // Create SpotLight1 and control its visibility and properties
const spotLight1 = new THREE.SpotLight(0xffffff, 0); // 初始強度為 0
spotLight1.position.set(30, 30, 30);
scene.add(spotLight1);
spotLightHelper1 = new THREE.SpotLightHelper(spotLight1, 1, 0xffffff);

// Create a folder for Spotlight 1 controls
const lightHelperControl1 = { showHelpers: false, isEnabled: false }; 
const Front_Light = gui.addFolder("Spotlight 1").close();
Front_Light.add(lightHelperControl1, 'isEnabled').name('Spotlight 1').onChange((value) => {
    spotLight1.visible = value; // 控制燈光的可見性
    spotLight1.intensity = value ? 500 : 0; // 當開啟時設置強度，否則為 0
});
Front_Light.add(lightHelperControl1, "showHelpers").name("Show Spotlight 1 Helpers").onChange((value) => {
    if (value) {
        scene.add(spotLightHelper1); // 添加燈光幫助器
    } else {
        scene.remove(spotLightHelper1); // 移除燈光幫助器
    }
});
Front_Light.add(spotLight1.position, 'x', -30, 30, 1).onChange(() => {
    spotLightHelper1.update();
});
Front_Light.add(spotLight1.position, 'y', -30, 30, 1).onChange(() => {
    spotLightHelper1.update();
});
Front_Light.add(spotLight1.position, 'z', -30, 30, 1).onChange(() => {
    spotLightHelper1.update();
});

// Create SpotLight2 and control its visibility and properties
const spotLight2 = new THREE.SpotLight(0xffffff, 0); // 初始強度為 0
spotLight2.position.set(-30, -30, -30);
scene.add(spotLight2);
spotLightHelper2 = new THREE.SpotLightHelper(spotLight2, 1, 0xffffff);

// Create a folder for Spotlight 2 controls
const lightHelperControl2 = { showHelpers: false, isEnabled: false }; 
const Back_Light = gui.addFolder("Spotlight 2").close();
Back_Light.add(lightHelperControl2, 'isEnabled').name('Spotlight 2').onChange((value) => {
    spotLight2.visible = value; // 控制燈光的可見性
    spotLight2.intensity = value ? 500 : 0; // 當開啟時設置強度，否則為 0
});
Back_Light.add(lightHelperControl2, "showHelpers").name("Show Spotlight 2 Helpers").onChange((value) => {
    if (value) {
        scene.add(spotLightHelper2); // 添加燈光幫助器
    } else {
        scene.remove(spotLightHelper2); // 移除燈光幫助器
    }
});
Back_Light.add(spotLight2.position, 'x', -30, 30, 1).onChange(() => {
    spotLightHelper2.update();
});
Back_Light.add(spotLight2.position, 'y', -30, 30, 1).onChange(() => {
    spotLightHelper2.update();
});
Back_Light.add(spotLight2.position, 'z', -30, 30, 1).onChange(() => {
    spotLightHelper2.update();
});
//
    //const loader = new GLTFLoader(loadingManager);

// 這部份是關於load 3d model 載入畫面和 載入3d model
    const loadModel = (file) => {
        // Change label to "Loading..."
        document.getElementById('loading-label').innerText = 'Loading...';
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.display = 'block'; // Show loading bar
        progressBar.value = 0; // Reset progress bar value

// if 判斷 .glb 和 .gltf  用黎攞取副檔名 
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const loader = new GLTFLoader(loadingManager);

// 依個係OBJLoader 和 mtlloader (mtl同obj 是一齊用的)
        const mtlloader = new MTLLoader(loadingManager);
// 只有OBJLoader是不會見到material 的 所以通常.obj 會連住一個.mtl的檔案
        const objloader = new OBJLoader(loadingManager);

// 依個係FBXLoader
        const fbxloader = new FBXLoader(loadingManager);
//_________
const stlloader = new STLLoader(loadingManager);



// if 判斷 .glb 和 .gltf 開始
        if (fileExtension === 'glb') {
        loader.load(
            URL.createObjectURL(file),
            (gltf) => {
                if (input_model) {
                    scene.remove(input_model); // Remove the existing model if there is one
                }

                input_model = gltf.scene.children[0];
                // input_model.position.set(0, -1.3, 0);
                input_model.position.set(0, 0, 0);
                // input_model.rotation.x = Math.PI / -3;

                

    // 創建包圍盒
    const box = new THREE.Box3().setFromObject(input_model);
    // const modelHeight = box.max.y - box.min.y; // 計算模型的高度
    // 計算模型的底部位置，使其位於網格上方
    const offset = 1.00; // 調整這個值以減少高度

    // input_model.position.y = box.min.y + offset; // 將模型的底部設置在網格上方
    input_model.position.y = 0;
    scene.add(gltf.scene);

    const boxHelper = new THREE.Box3Helper(box, 0xffff00); // 0xffff00 是黃色
    // scene.add(boxHelper); // 初始時加包圍盒助手

    // 將包圍盒助手添加到場景中
    // scene.add(boxHelper);
    const axesHelper = new THREE.AxesHelper( 200 );
    axesHelper.position.y = box.min.y - offset ; // 確保輔助軸與網格對齊
    axesHelper.visible = false; // 初始設置為隱藏
    scene.add( axesHelper );

    // 創建 GridHelper
const gridHelper = new THREE.GridHelper(200, 20); // 200 為大小，20 為細分數量
gridHelper.position.y = box.min.y - offset; // 將網格放置在模型下方
gridHelper.visible = false; // 初始設置為隱藏
scene.add(gridHelper);

    

    const params = {
        showBoxHelper: false, // 預設為不顯示包圍盒

        showAxes: false, // x,y,z軸
        showGrid: false,  //網格

        scale: 1,
        positionY: input_model.position.y
    };

    // Create a folder for Position Control in the GUI
const BoxHelper = gui.addFolder("Axes, Box, Grid Helper").close();

BoxHelper.add(params, 'showAxes').name('Show Axes').onChange((value) => {
    axesHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});

// 添加複選框到 GUI
BoxHelper.add(params, 'showBoxHelper').name('Show Box Helper').onChange(function(value) {
    if (value) {
        // 如果選中，將包圍盒助手添加到場景中
        scene.add(boxHelper);
    } else {
        // 如果未選中，從場景中移除包圍盒助手
        if (boxHelper) {
            scene.remove(boxHelper);
        }
    }
});


BoxHelper.add(params, 'showGrid').name('Show Grid').onChange((value) => {
    gridHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});

//  // 添加縮放和位置控制
//  BoxHelper.add(params, 'scale', 0.1, 5).onChange(value => {
//     input_model.scale.set(value, value, value);
//     updateHelpers(); // 更新幫助器位置
// });

// BoxHelper.add(params, 'positionY', -10, 10).onChange(value => {
//     input_model.position.y = value;
//     updateHelpers(); // 更新幫助器位置
// });

 // 更新幫助器位置的函數
 function updateHelpers() {
    const box = new THREE.Box3().setFromObject(input_model); // 更新包圍盒
    boxHelper.box = box; // 更新包圍盒助手的包圍盒
    axesHelper.position.y = box.min.y - offset; // 更新輔助軸位置
    gridHelper.position.y = box.min.y - offset; // 更新網格位置
}

updateHelpers(); // 初始化幫助器位置

        // 更新包圍盒和包圍盒助手的大小
        const updateBoxHelper = () => {
            box.setFromObject(input_model); // 更新包圍盒
            boxHelper.box = box; // 更新包圍盒助手的包圍盒
            // boxHelper.update(); // 更新顯示
        };

                // Create a folder for Position Control in the GUI
const positionControl = gui.addFolder("Position Control").close();

// Create an object to hold the position values
const positionControlValues = {
    posX: input_model.position.x,
    posY: input_model.position.y,
    posZ: input_model.position.z
};

// Add controls for x, y, and z positions
const posXControl = positionControl.add(positionControlValues, 'posX', -100, 100, 0.1).name('Position X');
const posYControl = positionControl.add(positionControlValues, 'posY', -100, 100, 0.1).name('Position Y');
const posZControl = positionControl.add(positionControlValues, 'posZ', -100, 100, 0.1).name('Position Z');

// Update the model's position when the GUI controls change
// 在添加 Position Control 的位置更新
posXControl.onChange((value) => {
    input_model.position.x = value;
    updateHelpers(); // 更新網格位置
});

posYControl.onChange((value) => {
    input_model.position.y = value;
    updateHelpers(); // 更新網格位置
});

posZControl.onChange((value) => {
    input_model.position.z = value;
    updateHelpers(); // 更新網格位置
});

// Optionally, you can add a reset position button
positionControl.add({
    resetPosition: () => {
        input_model.position.set(0, 0, 0); // Reset to initial position
        positionControlValues.posX = input_model.position.x; // Update GUI control
        positionControlValues.posY = input_model.position.y; // Update GUI control
        positionControlValues.posZ = input_model.position.z; // Update GUI control
        posXControl.updateDisplay(); // Update the GUI display
        posYControl.updateDisplay(); // Update the GUI display
        posZControl.updateDisplay(); // Update the GUI display
        updateBoxHelper();
        updateHelpers(); // 更新網格位置
        console.log("Position reset to default:", input_model.position);
    }
}, 'resetPosition').name('Reset Position');

                // Get the default scale of the model
                defaultScale = input_model.scale.clone();

                // Scale control parameters
                scaleControl = {
                    scaleX: defaultScale.x,
                    scaleY: defaultScale.y,
                    scaleZ: defaultScale.z,
                    uniformScale: 1 //新增的屬性
                };

        const Scale_control = gui.addFolder("Scale Control").close();

        // Add GUI controls for scaling
        const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
        const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
        const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');

// 在 Scale_control 中添加 uniformScale 控件
const uniformScaleControl = Scale_control.add(scaleControl, 'uniformScale', 0.001, 3).name('Uniform Scale').onChange(value => {
    input_model.scale.set(value, value, value); // 同時設置 x, y, z 的縮放
    scaleControl.scaleX = value; // 更新 scaleControl 的值
    scaleControl.scaleY = value; // 更新 scaleControl 的值
    scaleControl.scaleZ = value; // 更新 scaleControl 的值

    scaleXControl.setValue(value); // 更新 GUI 控件
    scaleYControl.setValue(value); // 更新 GUI 控件
    scaleZControl.setValue(value); // 更新 GUI 控件

    scaleXControl.updateDisplay(); // 更新 GUI 顯示
    scaleYControl.updateDisplay(); // 更新 GUI 顯示
    scaleZControl.updateDisplay(); // 更新 GUI 顯示

    updateBoxHelper(); // 更新包圍盒助手
    updateHelpers(); // 更新網格位置
});

        scaleXControl.onChange((value) => {
            input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
            scaleControl.scaleX = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleXControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });

        scaleYControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
            scaleControl.scaleY = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleYControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });
    
        scaleZControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
            scaleControl.scaleZ = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleZControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });



        Scale_control.add({ 
            resetScale: () => {
                input_model.scale.copy(defaultScale); // Reset the model scale to default
        
                // 更新所有縮放控制的值
                scaleControl.scaleX = defaultScale.x; 
                scaleControl.scaleY = defaultScale.y; 
                scaleControl.scaleZ = defaultScale.z; 
        
                // 設置 uniformScale 為 1
                scaleControl.uniformScale = 1;
        
                // 更新 GUI 控件
                scaleXControl.setValue(defaultScale.x); 
                scaleYControl.setValue(defaultScale.y); 
                scaleZControl.setValue(defaultScale.z); 
                scaleXControl.updateDisplay(); 
                scaleYControl.updateDisplay(); 
                scaleZControl.updateDisplay(); 
        
                // 直接使用 uniformScaleControl
        uniformScaleControl.setValue(1); // 設置為 1
        uniformScaleControl.updateDisplay(); // 更新顯示
        
                updateBoxHelper(); // 更新包圍盒助手
                updateHelpers(); // 更新網格位置
                console.log("Scale reset to default:", defaultScale);
            }
        }, 'resetScale').name('Reset Scale');

        // Show the GUI
        gui.domElement.style.display = 'block';            
            },
            (xhr) => {
                const progressBar = document.getElementById('progress-bar');
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    progressBar.value = percentComplete;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
            }
            
        );
    } else if (fileExtension === 'gltf') {
        loader.load(
            URL.createObjectURL(file),
            (gltf) => {
                if (input_model) {
                    scene.remove(input_model); // Remove the existing model if there is one
                }

                input_model = gltf.scene.children[0];
                // input_model.position.set(0, -1.3, 0);
                input_model.position.set(0, 0, 0);
                // input_model.rotation.x = Math.PI / -3;

                

    // 創建包圍盒
    const box = new THREE.Box3().setFromObject(input_model);
    // const modelHeight = box.max.y - box.min.y; // 計算模型的高度
    // 計算模型的底部位置，使其位於網格上方
    const offset = 1.00; // 調整這個值以減少高度

    // input_model.position.y = box.min.y + offset; // 將模型的底部設置在網格上方
    input_model.position.y = 0;
    scene.add(gltf.scene);

    const boxHelper = new THREE.Box3Helper(box, 0xffff00); // 0xffff00 是黃色
    // scene.add(boxHelper); // 初始時加包圍盒助手

    // 將包圍盒助手添加到場景中
    // scene.add(boxHelper);
    const axesHelper = new THREE.AxesHelper( 200 );
    axesHelper.position.y = box.min.y - offset ; // 確保輔助軸與網格對齊
    axesHelper.visible = false; // 初始設置為隱藏
    scene.add( axesHelper );

    // 創建 GridHelper
const gridHelper = new THREE.GridHelper(200, 20); // 200 為大小，20 為細分數量
gridHelper.position.y = box.min.y - offset; // 將網格放置在模型下方
gridHelper.visible = false; // 初始設置為隱藏
scene.add(gridHelper);

    

    const params = {
        showBoxHelper: false, // 預設為不顯示包圍盒

        showAxes: false, // x,y,z軸
        showGrid: false,  //網格

        scale: 1,
        positionY: input_model.position.y
    };

    // Create a folder for Position Control in the GUI
const BoxHelper = gui.addFolder("Axes, Box, Grid Helper").close();

BoxHelper.add(params, 'showAxes').name('Show Axes').onChange((value) => {
    axesHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});

// 添加複選框到 GUI
BoxHelper.add(params, 'showBoxHelper').name('Show Box Helper').onChange(function(value) {
    if (value) {
        // 如果選中，將包圍盒助手添加到場景中
        scene.add(boxHelper);
    } else {
        // 如果未選中，從場景中移除包圍盒助手
        if (boxHelper) {
            scene.remove(boxHelper);
        }
    }
});


BoxHelper.add(params, 'showGrid').name('Show Grid').onChange((value) => {
    gridHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});

//  // 添加縮放和位置控制
//  BoxHelper.add(params, 'scale', 0.1, 5).onChange(value => {
//     input_model.scale.set(value, value, value);
//     updateHelpers(); // 更新幫助器位置
// });

// BoxHelper.add(params, 'positionY', -10, 10).onChange(value => {
//     input_model.position.y = value;
//     updateHelpers(); // 更新幫助器位置
// });

 // 更新幫助器位置的函數
 function updateHelpers() {
    const box = new THREE.Box3().setFromObject(input_model); // 更新包圍盒
    boxHelper.box = box; // 更新包圍盒助手的包圍盒
    axesHelper.position.y = box.min.y - offset; // 更新輔助軸位置
    gridHelper.position.y = box.min.y - offset; // 更新網格位置
}

updateHelpers(); // 初始化幫助器位置

        // 更新包圍盒和包圍盒助手的大小
        const updateBoxHelper = () => {
            box.setFromObject(input_model); // 更新包圍盒
            boxHelper.box = box; // 更新包圍盒助手的包圍盒
            // boxHelper.update(); // 更新顯示
        };

                // Create a folder for Position Control in the GUI
const positionControl = gui.addFolder("Position Control").close();

// Create an object to hold the position values
const positionControlValues = {
    posX: input_model.position.x,
    posY: input_model.position.y,
    posZ: input_model.position.z
};

// Add controls for x, y, and z positions
const posXControl = positionControl.add(positionControlValues, 'posX', -100, 100, 0.1).name('Position X');
const posYControl = positionControl.add(positionControlValues, 'posY', -100, 100, 0.1).name('Position Y');
const posZControl = positionControl.add(positionControlValues, 'posZ', -100, 100, 0.1).name('Position Z');

// Update the model's position when the GUI controls change
// 在添加 Position Control 的位置更新
posXControl.onChange((value) => {
    input_model.position.x = value;
    updateHelpers(); // 更新網格位置
});

posYControl.onChange((value) => {
    input_model.position.y = value;
    updateHelpers(); // 更新網格位置
});

posZControl.onChange((value) => {
    input_model.position.z = value;
    updateHelpers(); // 更新網格位置
});

// Optionally, you can add a reset position button
positionControl.add({
    resetPosition: () => {
        input_model.position.set(0, 0, 0); // Reset to initial position
        positionControlValues.posX = input_model.position.x; // Update GUI control
        positionControlValues.posY = input_model.position.y; // Update GUI control
        positionControlValues.posZ = input_model.position.z; // Update GUI control
        posXControl.updateDisplay(); // Update the GUI display
        posYControl.updateDisplay(); // Update the GUI display
        posZControl.updateDisplay(); // Update the GUI display
        updateBoxHelper();
        updateHelpers(); // 更新網格位置
        console.log("Position reset to default:", input_model.position);
    }
}, 'resetPosition').name('Reset Position');

                // Get the default scale of the model
                defaultScale = input_model.scale.clone();

                // Scale control parameters
                scaleControl = {
                    scaleX: defaultScale.x,
                    scaleY: defaultScale.y,
                    scaleZ: defaultScale.z,
                    uniformScale: 1 //新增的屬性
                };

        const Scale_control = gui.addFolder("Scale Control").close();

        // Add GUI controls for scaling
        const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
        const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
        const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');

// 在 Scale_control 中添加 uniformScale 控件
const uniformScaleControl = Scale_control.add(scaleControl, 'uniformScale', 0.001, 3).name('Uniform Scale').onChange(value => {
    input_model.scale.set(value, value, value); // 同時設置 x, y, z 的縮放
    scaleControl.scaleX = value; // 更新 scaleControl 的值
    scaleControl.scaleY = value; // 更新 scaleControl 的值
    scaleControl.scaleZ = value; // 更新 scaleControl 的值

    scaleXControl.setValue(value); // 更新 GUI 控件
    scaleYControl.setValue(value); // 更新 GUI 控件
    scaleZControl.setValue(value); // 更新 GUI 控件

    scaleXControl.updateDisplay(); // 更新 GUI 顯示
    scaleYControl.updateDisplay(); // 更新 GUI 顯示
    scaleZControl.updateDisplay(); // 更新 GUI 顯示

    updateBoxHelper(); // 更新包圍盒助手
    updateHelpers(); // 更新網格位置
});

        scaleXControl.onChange((value) => {
            input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
            scaleControl.scaleX = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleXControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });

        scaleYControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
            scaleControl.scaleY = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleYControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });
    
        scaleZControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
            scaleControl.scaleZ = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleZControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });



        Scale_control.add({ 
            resetScale: () => {
                input_model.scale.copy(defaultScale); // Reset the model scale to default
        
                // 更新所有縮放控制的值
                scaleControl.scaleX = defaultScale.x; 
                scaleControl.scaleY = defaultScale.y; 
                scaleControl.scaleZ = defaultScale.z; 
        
                // 設置 uniformScale 為 1
                scaleControl.uniformScale = 1;
        
                // 更新 GUI 控件
                scaleXControl.setValue(defaultScale.x); 
                scaleYControl.setValue(defaultScale.y); 
                scaleZControl.setValue(defaultScale.z); 
                scaleXControl.updateDisplay(); 
                scaleYControl.updateDisplay(); 
                scaleZControl.updateDisplay(); 
        
                // 直接使用 uniformScaleControl
        uniformScaleControl.setValue(1); // 設置為 1
        uniformScaleControl.updateDisplay(); // 更新顯示
        
                updateBoxHelper(); // 更新包圍盒助手
                updateHelpers(); // 更新網格位置
                console.log("Scale reset to default:", defaultScale);
            }
        }, 'resetScale').name('Reset Scale');

        // Show the GUI
        gui.domElement.style.display = 'block';            
            },
            (xhr) => {
                const progressBar = document.getElementById('progress-bar');
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    progressBar.value = percentComplete;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
            }
            
        );
}else if (fileExtension === 'obj'){

    // 新增的mtl
    // Create an input for MTL file upload
    const mtlInput = document.createElement('input');
    mtlInput.type = 'file';
    mtlInput.accept = '.mtl';
    mtlInput.style.display = 'none';
    document.body.appendChild(mtlInput);

    // Create an object for GUI control
    const uploadParams = {
        uploadMTL: () => mtlInput.click()
    };

    // Add upload button to the GUI
    gui.add(uploadParams, 'uploadMTL').name("Upload .mtl");


    const mtlButton = document.createElement('button');
    mtlButton.innerText = 'Upload MTL';
    mtlButton.onclick = () => mtlInput.click();
    document.body.appendChild(mtlButton);


    objloader.load(
        URL.createObjectURL(file),
        (obj) => {
            if (input_model) {
                scene.remove(input_model); // Remove the existing model if there is one
            }

            // input_model = fbx.scene.children[0];
            input_model = obj;

                // input_model.position.set(0, -1.3, 0);
                input_model.position.set(0, 0, 0);
                // input_model.rotation.x = Math.PI / -3;

                scene.add(obj);
    // 創建包圍盒
    const box = new THREE.Box3().setFromObject(input_model);
    // const modelHeight = box.max.y - box.min.y; // 計算模型的高度
    // 計算模型的底部位置，使其位於網格上方
    const offset = 1.00; // 調整這個值以減少高度

    //


    // input_model.position.y = box.min.y + offset; // 將模型的底部設置在網格上方
    input_model.position.y = 0;

            // input_model.position.set(0, -1.3, 0);
            // input_model.rotation.x = Math.PI / -3;

            const boxHelper = new THREE.Box3Helper(box, 0xffff00); // 0xffff00 是黃色
    // scene.add(boxHelper); // 初始時加包圍盒助手


    // 將包圍盒助手添加到場景中
    // scene.add(boxHelper);
    const axesHelper = new THREE.AxesHelper( 200 );
    axesHelper.position.y = box.min.y - offset ; // 確保輔助軸與網格對齊
    axesHelper.visible = false; // 初始設置為隱藏
    scene.add( axesHelper );


    // 創建 GridHelper
const gridHelper = new THREE.GridHelper(200, 20); // 200 為大小，20 為細分數量
gridHelper.position.y = box.min.y - offset; // 將網格放置在模型下方
gridHelper.visible = false; // 初始設置為隱藏
scene.add(gridHelper);


   


    const params = {
        showBoxHelper: false, // 預設為不顯示包圍盒


        showAxes: false, // x,y,z軸
        showGrid: false,  //網格


        scale: 1,
        positionY: input_model.position.y
    };


    // Create a folder for Position Control in the GUI
const BoxHelper = gui.addFolder("Axes, Box, Grid Helper").close();


BoxHelper.add(params, 'showAxes').name('Show Axes').onChange((value) => {
    axesHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});


// 添加複選框到 GUI
BoxHelper.add(params, 'showBoxHelper').name('Show Box Helper').onChange(function(value) {
    if (value) {
        // 如果選中，將包圍盒助手添加到場景中
        scene.add(boxHelper);
    } else {
        // 如果未選中，從場景中移除包圍盒助手
        if (boxHelper) {
            scene.remove(boxHelper);
        }
    }
});




BoxHelper.add(params, 'showGrid').name('Show Grid').onChange((value) => {
    gridHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});


//  // 添加縮放和位置控制
//  BoxHelper.add(params, 'scale', 0.1, 5).onChange(value => {
//     input_model.scale.set(value, value, value);
//     updateHelpers(); // 更新幫助器位置
// });


// BoxHelper.add(params, 'positionY', -10, 10).onChange(value => {
//     input_model.position.y = value;
//     updateHelpers(); // 更新幫助器位置
// });


 // 更新幫助器位置的函數
 function updateHelpers() {
    const box = new THREE.Box3().setFromObject(input_model); // 更新包圍盒
    boxHelper.box = box; // 更新包圍盒助手的包圍盒
    axesHelper.position.y = box.min.y - offset; // 更新輔助軸位置
    gridHelper.position.y = box.min.y - offset; // 更新網格位置
}


updateHelpers(); // 初始化幫助器位置


        // 更新包圍盒和包圍盒助手的大小
        const updateBoxHelper = () => {
            box.setFromObject(input_model); // 更新包圍盒
            boxHelper.box = box; // 更新包圍盒助手的包圍盒
            // boxHelper.update(); // 更新顯示
        };


                // Create a folder for Position Control in the GUI
const positionControl = gui.addFolder("Position Control").close();


// Create an object to hold the position values
const positionControlValues = {
    posX: input_model.position.x,
    posY: input_model.position.y,
    posZ: input_model.position.z
};


// Add controls for x, y, and z positions
const posXControl = positionControl.add(positionControlValues, 'posX', -100, 100, 0.1).name('Position X');
const posYControl = positionControl.add(positionControlValues, 'posY', -100, 100, 0.1).name('Position Y');
const posZControl = positionControl.add(positionControlValues, 'posZ', -100, 100, 0.1).name('Position Z');


// Update the model's position when the GUI controls change
// 在添加 Position Control 的位置更新
posXControl.onChange((value) => {
    input_model.position.x = value;
    updateHelpers(); // 更新網格位置
});


posYControl.onChange((value) => {
    input_model.position.y = value;
    updateHelpers(); // 更新網格位置
});


posZControl.onChange((value) => {
    input_model.position.z = value;
    updateHelpers(); // 更新網格位置
});


// Optionally, you can add a reset position button
positionControl.add({
    resetPosition: () => {
        input_model.position.set(0, 0, 0); // Reset to initial position
        positionControlValues.posX = input_model.position.x; // Update GUI control
        positionControlValues.posY = input_model.position.y; // Update GUI control
        positionControlValues.posZ = input_model.position.z; // Update GUI control
        posXControl.updateDisplay(); // Update the GUI display
        posYControl.updateDisplay(); // Update the GUI display
        posZControl.updateDisplay(); // Update the GUI display
        updateBoxHelper();
        updateHelpers(); // 更新網格位置
        console.log("Position reset to default:", input_model.position);
    }
}, 'resetPosition').name('Reset Position');


                // Get the default scale of the model
                defaultScale = input_model.scale.clone();


                // Scale control parameters
                scaleControl = {
                    scaleX: defaultScale.x,
                    scaleY: defaultScale.y,
                    scaleZ: defaultScale.z,
                    uniformScale: 1 //新增的屬性
                };


        const Scale_control = gui.addFolder("Scale Control").close();


        // Add GUI controls for scaling
        const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
        const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
        const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');


// 在 Scale_control 中添加 uniformScale 控件
const uniformScaleControl = Scale_control.add(scaleControl, 'uniformScale', 0.001, 3).name('Uniform Scale').onChange(value => {
    input_model.scale.set(value, value, value); // 同時設置 x, y, z 的縮放
    scaleControl.scaleX = value; // 更新 scaleControl 的值
    scaleControl.scaleY = value; // 更新 scaleControl 的值
    scaleControl.scaleZ = value; // 更新 scaleControl 的值


    scaleXControl.setValue(value); // 更新 GUI 控件
    scaleYControl.setValue(value); // 更新 GUI 控件
    scaleZControl.setValue(value); // 更新 GUI 控件


    scaleXControl.updateDisplay(); // 更新 GUI 顯示
    scaleYControl.updateDisplay(); // 更新 GUI 顯示
    scaleZControl.updateDisplay(); // 更新 GUI 顯示


    updateBoxHelper(); // 更新包圍盒助手
    updateHelpers(); // 更新網格位置
});


        scaleXControl.onChange((value) => {
            input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
            scaleControl.scaleX = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleXControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });


        scaleYControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
            scaleControl.scaleY = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleYControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });
   
        scaleZControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
            scaleControl.scaleZ = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleZControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });






        Scale_control.add({
            resetScale: () => {
                input_model.scale.copy(defaultScale); // Reset the model scale to default
       
                // 更新所有縮放控制的值
                scaleControl.scaleX = defaultScale.x;
                scaleControl.scaleY = defaultScale.y;
                scaleControl.scaleZ = defaultScale.z;
       
                // 設置 uniformScale 為 1
                scaleControl.uniformScale = 1;
       
                // 更新 GUI 控件
                scaleXControl.setValue(defaultScale.x);
                scaleYControl.setValue(defaultScale.y);
                scaleZControl.setValue(defaultScale.z);
                scaleXControl.updateDisplay();
                scaleYControl.updateDisplay();
                scaleZControl.updateDisplay();
       
                // 直接使用 uniformScaleControl
        uniformScaleControl.setValue(1); // 設置為 1
        uniformScaleControl.updateDisplay(); // 更新顯示
       
                updateBoxHelper(); // 更新包圍盒助手
                updateHelpers(); // 更新網格位置
                console.log("Scale reset to default:", defaultScale);
            }
        }, 'resetScale').name('Reset Scale');


        // Show the GUI
        gui.domElement.style.display = 'block';  
        
        
        //
// Handle MTL file upload
mtlInput.addEventListener('change', (mtlEvent) => {
    const mtlFile = mtlEvent.target.files[0];
    if(mtlFile){
        mtlloader.load(URL.createObjectURL(mtlFile), (mtl) => {
            mtl.preload();
            objloader.setMaterials(mtl);

            //Apply materials to the model
            input_model.traverse((node)=>{
                if(node.isMesh){
                    node.material = mtl.materials[node.material.name];
                }
            });
        }, undefined, (error) => {
            console.error("Error Loading MTL file:" , error);
        }
    );
    } else{
        console.error("No MTL file uploaded");
    }
});

        //
            },
            (xhr) => {
                const progressBar = document.getElementById('progress-bar');
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    progressBar.value = percentComplete;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
            }
           
        );

}
else if (fileExtension === 'fbx'){
    fbxloader.load(
        URL.createObjectURL(file),
        (fbx) => {
            if (input_model) {
                scene.remove(input_model); // Remove the existing model if there is one
            }

            // input_model = fbx.scene.children[0];
            input_model = fbx;

                // input_model.position.set(0, -1.3, 0);
                input_model.position.set(0, 0, 0);
                // input_model.rotation.x = Math.PI / -3;

    // 創建包圍盒
    const box = new THREE.Box3().setFromObject(input_model);
    // const modelHeight = box.max.y - box.min.y; // 計算模型的高度
    // 計算模型的底部位置，使其位於網格上方
    const offset = 1.00; // 調整這個值以減少高度


    // input_model.position.y = box.min.y + offset; // 將模型的底部設置在網格上方
    input_model.position.y = 0;

            // input_model.position.set(0, -1.3, 0);
            // input_model.rotation.x = Math.PI / -3;
            scene.add(fbx);

            const boxHelper = new THREE.Box3Helper(box, 0xffff00); // 0xffff00 是黃色
    // scene.add(boxHelper); // 初始時加包圍盒助手


    // 將包圍盒助手添加到場景中
    // scene.add(boxHelper);
    const axesHelper = new THREE.AxesHelper( 200 );
    axesHelper.position.y = box.min.y - offset ; // 確保輔助軸與網格對齊
    axesHelper.visible = false; // 初始設置為隱藏
    scene.add( axesHelper );


    // 創建 GridHelper
const gridHelper = new THREE.GridHelper(200, 20); // 200 為大小，20 為細分數量
gridHelper.position.y = box.min.y - offset; // 將網格放置在模型下方
gridHelper.visible = false; // 初始設置為隱藏
scene.add(gridHelper);


   


    const params = {
        showBoxHelper: false, // 預設為不顯示包圍盒


        showAxes: false, // x,y,z軸
        showGrid: false,  //網格


        scale: 1,
        positionY: input_model.position.y
    };


    // Create a folder for Position Control in the GUI
const BoxHelper = gui.addFolder("Axes, Box, Grid Helper").close();


BoxHelper.add(params, 'showAxes').name('Show Axes').onChange((value) => {
    axesHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});


// 添加複選框到 GUI
BoxHelper.add(params, 'showBoxHelper').name('Show Box Helper').onChange(function(value) {
    if (value) {
        // 如果選中，將包圍盒助手添加到場景中
        scene.add(boxHelper);
    } else {
        // 如果未選中，從場景中移除包圍盒助手
        if (boxHelper) {
            scene.remove(boxHelper);
        }
    }
});




BoxHelper.add(params, 'showGrid').name('Show Grid').onChange((value) => {
    gridHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
});


//  // 添加縮放和位置控制
//  BoxHelper.add(params, 'scale', 0.1, 5).onChange(value => {
//     input_model.scale.set(value, value, value);
//     updateHelpers(); // 更新幫助器位置
// });


// BoxHelper.add(params, 'positionY', -10, 10).onChange(value => {
//     input_model.position.y = value;
//     updateHelpers(); // 更新幫助器位置
// });


 // 更新幫助器位置的函數
 function updateHelpers() {
    const box = new THREE.Box3().setFromObject(input_model); // 更新包圍盒
    boxHelper.box = box; // 更新包圍盒助手的包圍盒
    axesHelper.position.y = box.min.y - offset; // 更新輔助軸位置
    gridHelper.position.y = box.min.y - offset; // 更新網格位置
}


updateHelpers(); // 初始化幫助器位置


        // 更新包圍盒和包圍盒助手的大小
        const updateBoxHelper = () => {
            box.setFromObject(input_model); // 更新包圍盒
            boxHelper.box = box; // 更新包圍盒助手的包圍盒
            // boxHelper.update(); // 更新顯示
        };


                // Create a folder for Position Control in the GUI
const positionControl = gui.addFolder("Position Control").close();


// Create an object to hold the position values
const positionControlValues = {
    posX: input_model.position.x,
    posY: input_model.position.y,
    posZ: input_model.position.z
};


// Add controls for x, y, and z positions
const posXControl = positionControl.add(positionControlValues, 'posX', -100, 100, 0.1).name('Position X');
const posYControl = positionControl.add(positionControlValues, 'posY', -100, 100, 0.1).name('Position Y');
const posZControl = positionControl.add(positionControlValues, 'posZ', -100, 100, 0.1).name('Position Z');


// Update the model's position when the GUI controls change
// 在添加 Position Control 的位置更新
posXControl.onChange((value) => {
    input_model.position.x = value;
    updateHelpers(); // 更新網格位置
});


posYControl.onChange((value) => {
    input_model.position.y = value;
    updateHelpers(); // 更新網格位置
});


posZControl.onChange((value) => {
    input_model.position.z = value;
    updateHelpers(); // 更新網格位置
});


// Optionally, you can add a reset position button
positionControl.add({
    resetPosition: () => {
        input_model.position.set(0, 0, 0); // Reset to initial position
        positionControlValues.posX = input_model.position.x; // Update GUI control
        positionControlValues.posY = input_model.position.y; // Update GUI control
        positionControlValues.posZ = input_model.position.z; // Update GUI control
        posXControl.updateDisplay(); // Update the GUI display
        posYControl.updateDisplay(); // Update the GUI display
        posZControl.updateDisplay(); // Update the GUI display
        updateBoxHelper();
        updateHelpers(); // 更新網格位置
        console.log("Position reset to default:", input_model.position);
    }
}, 'resetPosition').name('Reset Position');


                // Get the default scale of the model
                defaultScale = input_model.scale.clone();


                // Scale control parameters
                scaleControl = {
                    scaleX: defaultScale.x,
                    scaleY: defaultScale.y,
                    scaleZ: defaultScale.z,
                    uniformScale: 1 //新增的屬性
                };


        const Scale_control = gui.addFolder("Scale Control").close();


        // Add GUI controls for scaling
        const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
        const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
        const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');


// 在 Scale_control 中添加 uniformScale 控件
const uniformScaleControl = Scale_control.add(scaleControl, 'uniformScale', 0.001, 3).name('Uniform Scale').onChange(value => {
    input_model.scale.set(value, value, value); // 同時設置 x, y, z 的縮放
    scaleControl.scaleX = value; // 更新 scaleControl 的值
    scaleControl.scaleY = value; // 更新 scaleControl 的值
    scaleControl.scaleZ = value; // 更新 scaleControl 的值


    scaleXControl.setValue(value); // 更新 GUI 控件
    scaleYControl.setValue(value); // 更新 GUI 控件
    scaleZControl.setValue(value); // 更新 GUI 控件


    scaleXControl.updateDisplay(); // 更新 GUI 顯示
    scaleYControl.updateDisplay(); // 更新 GUI 顯示
    scaleZControl.updateDisplay(); // 更新 GUI 顯示


    updateBoxHelper(); // 更新包圍盒助手
    updateHelpers(); // 更新網格位置
});


        scaleXControl.onChange((value) => {
            input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
            scaleControl.scaleX = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleXControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });


        scaleYControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
            scaleControl.scaleY = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleYControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });
   
        scaleZControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
            scaleControl.scaleZ = value; // 更新 scaleControl 的值
            updateBoxHelper(); // 更新包圍盒助手
            scaleZControl.updateDisplay(); // Update the GUI display
            updateHelpers(); // 更新網格位置
        });






        Scale_control.add({
            resetScale: () => {
                input_model.scale.copy(defaultScale); // Reset the model scale to default
       
                // 更新所有縮放控制的值
                scaleControl.scaleX = defaultScale.x;
                scaleControl.scaleY = defaultScale.y;
                scaleControl.scaleZ = defaultScale.z;
       
                // 設置 uniformScale 為 1
                scaleControl.uniformScale = 1;
       
                // 更新 GUI 控件
                scaleXControl.setValue(defaultScale.x);
                scaleYControl.setValue(defaultScale.y);
                scaleZControl.setValue(defaultScale.z);
                scaleXControl.updateDisplay();
                scaleYControl.updateDisplay();
                scaleZControl.updateDisplay();
       
                // 直接使用 uniformScaleControl
        uniformScaleControl.setValue(1); // 設置為 1
        uniformScaleControl.updateDisplay(); // 更新顯示
       
                updateBoxHelper(); // 更新包圍盒助手
                updateHelpers(); // 更新網格位置
                console.log("Scale reset to default:", defaultScale);
            }
        }, 'resetScale').name('Reset Scale');


        // Show the GUI
        gui.domElement.style.display = 'block';            
            },
            (xhr) => {
                const progressBar = document.getElementById('progress-bar');
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    progressBar.value = percentComplete;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
            }
           
        );

}else if (fileExtension === 'stl'){
    stlloader.load(
        URL.createObjectURL(file), // Use the file URL
        (geometry) => {
            if (input_model) {
                scene.remove(input_model); // Remove the existing model if there is one
            }

            const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
            // input_model = stl.scene.children[0];
            // input_model = new THREE.Mesh(geometry);
            input_model = new THREE.Mesh(geometry, material);

            input_model.position.set(0, 0, 0);
            // input_model.rotation.x = Math.PI / -3;


           


// 創建包圍盒
const box = new THREE.Box3().setFromObject(input_model);
// const modelHeight = box.max.y - box.min.y; // 計算模型的高度
// 計算模型的底部位置，使其位於網格上方
const offset = 1.00; // 調整這個值以減少高度


// input_model.position.y = box.min.y + offset; // 將模型的底部設置在網格上方
input_model.position.y = 0;


            // input_model.position.set(0, -1.3, 0);
            // input_model.rotation.x = Math.PI / -3;
            scene.add(input_model);

            const boxHelper = new THREE.Box3Helper(box, 0xffff00); // 0xffff00 是黃色
            // scene.add(boxHelper); // 初始時加包圍盒助手
        
        
            // 將包圍盒助手添加到場景中
            // scene.add(boxHelper);
            const axesHelper = new THREE.AxesHelper( 200 );
            axesHelper.position.y = box.min.y - offset ; // 確保輔助軸與網格對齊
            axesHelper.visible = false; // 初始設置為隱藏
            scene.add( axesHelper );
        
        
            // 創建 GridHelper
        const gridHelper = new THREE.GridHelper(200, 20); // 200 為大小，20 為細分數量
        gridHelper.position.y = box.min.y - offset; // 將網格放置在模型下方
        gridHelper.visible = false; // 初始設置為隱藏
        scene.add(gridHelper);
        
        
           
        
        
            const params = {
                showBoxHelper: false, // 預設為不顯示包圍盒
        
        
                showAxes: false, // x,y,z軸
                showGrid: false,  //網格
        
        
                scale: 1,
                positionY: input_model.position.y
            };
        
        
            // Create a folder for Position Control in the GUI
        const BoxHelper = gui.addFolder("Axes, Box, Grid Helper").close();
        
        
        BoxHelper.add(params, 'showAxes').name('Show Axes').onChange((value) => {
            axesHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
        });
        
        
        // 添加複選框到 GUI
        BoxHelper.add(params, 'showBoxHelper').name('Show Box Helper').onChange(function(value) {
            if (value) {
                // 如果選中，將包圍盒助手添加到場景中
                scene.add(boxHelper);
            } else {
                // 如果未選中，從場景中移除包圍盒助手
                if (boxHelper) {
                    scene.remove(boxHelper);
                }
            }
        });
        
        
        
        
        BoxHelper.add(params, 'showGrid').name('Show Grid').onChange((value) => {
            gridHelper.visible = value; // 根據 checkbox 的值顯示或隱藏
        });
        
        
        //  // 添加縮放和位置控制
        //  BoxHelper.add(params, 'scale', 0.1, 5).onChange(value => {
        //     input_model.scale.set(value, value, value);
        //     updateHelpers(); // 更新幫助器位置
        // });
        
        
        // BoxHelper.add(params, 'positionY', -10, 10).onChange(value => {
        //     input_model.position.y = value;
        //     updateHelpers(); // 更新幫助器位置
        // });
        
        
         // 更新幫助器位置的函數
         function updateHelpers() {
            const box = new THREE.Box3().setFromObject(input_model); // 更新包圍盒
            boxHelper.box = box; // 更新包圍盒助手的包圍盒
            axesHelper.position.y = box.min.y - offset; // 更新輔助軸位置
            gridHelper.position.y = box.min.y - offset; // 更新網格位置
        }
        
        
        updateHelpers(); // 初始化幫助器位置
        
        
                // 更新包圍盒和包圍盒助手的大小
                const updateBoxHelper = () => {
                    box.setFromObject(input_model); // 更新包圍盒
                    boxHelper.box = box; // 更新包圍盒助手的包圍盒
                    // boxHelper.update(); // 更新顯示
                };
        
        
                        // Create a folder for Position Control in the GUI
        const positionControl = gui.addFolder("Position Control").close();
        
        
        // Create an object to hold the position values
        const positionControlValues = {
            posX: input_model.position.x,
            posY: input_model.position.y,
            posZ: input_model.position.z
        };
        
        
        // Add controls for x, y, and z positions
        const posXControl = positionControl.add(positionControlValues, 'posX', -100, 100, 0.1).name('Position X');
        const posYControl = positionControl.add(positionControlValues, 'posY', -100, 100, 0.1).name('Position Y');
        const posZControl = positionControl.add(positionControlValues, 'posZ', -100, 100, 0.1).name('Position Z');
        
        
        // Update the model's position when the GUI controls change
        // 在添加 Position Control 的位置更新
        posXControl.onChange((value) => {
            input_model.position.x = value;
            updateHelpers(); // 更新網格位置
        });
        
        
        posYControl.onChange((value) => {
            input_model.position.y = value;
            updateHelpers(); // 更新網格位置
        });
        
        
        posZControl.onChange((value) => {
            input_model.position.z = value;
            updateHelpers(); // 更新網格位置
        });
        
        
        // Optionally, you can add a reset position button
        positionControl.add({
            resetPosition: () => {
                input_model.position.set(0, 0, 0); // Reset to initial position
                positionControlValues.posX = input_model.position.x; // Update GUI control
                positionControlValues.posY = input_model.position.y; // Update GUI control
                positionControlValues.posZ = input_model.position.z; // Update GUI control
                posXControl.updateDisplay(); // Update the GUI display
                posYControl.updateDisplay(); // Update the GUI display
                posZControl.updateDisplay(); // Update the GUI display
                updateBoxHelper();
                updateHelpers(); // 更新網格位置
                console.log("Position reset to default:", input_model.position);
            }
        }, 'resetPosition').name('Reset Position');
        
        
                        // Get the default scale of the model
                        defaultScale = input_model.scale.clone();
        
        
                        // Scale control parameters
                        scaleControl = {
                            scaleX: defaultScale.x,
                            scaleY: defaultScale.y,
                            scaleZ: defaultScale.z,
                            uniformScale: 1 //新增的屬性
                        };
        
        
                const Scale_control = gui.addFolder("Scale Control").close();
        
        
                // Add GUI controls for scaling
                const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
                const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
                const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');
        
        
        // 在 Scale_control 中添加 uniformScale 控件
        const uniformScaleControl = Scale_control.add(scaleControl, 'uniformScale', 0.001, 3).name('Uniform Scale').onChange(value => {
            input_model.scale.set(value, value, value); // 同時設置 x, y, z 的縮放
            scaleControl.scaleX = value; // 更新 scaleControl 的值
            scaleControl.scaleY = value; // 更新 scaleControl 的值
            scaleControl.scaleZ = value; // 更新 scaleControl 的值
        
        
            scaleXControl.setValue(value); // 更新 GUI 控件
            scaleYControl.setValue(value); // 更新 GUI 控件
            scaleZControl.setValue(value); // 更新 GUI 控件
        
        
            scaleXControl.updateDisplay(); // 更新 GUI 顯示
            scaleYControl.updateDisplay(); // 更新 GUI 顯示
            scaleZControl.updateDisplay(); // 更新 GUI 顯示
        
        
            updateBoxHelper(); // 更新包圍盒助手
            updateHelpers(); // 更新網格位置
        });
        
        
                scaleXControl.onChange((value) => {
                    input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
                    scaleControl.scaleX = value; // 更新 scaleControl 的值
                    updateBoxHelper(); // 更新包圍盒助手
                    scaleXControl.updateDisplay(); // Update the GUI display
                    updateHelpers(); // 更新網格位置
                });
        
        
                scaleYControl.onChange((value) => {
                    input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
                    scaleControl.scaleY = value; // 更新 scaleControl 的值
                    updateBoxHelper(); // 更新包圍盒助手
                    scaleYControl.updateDisplay(); // Update the GUI display
                    updateHelpers(); // 更新網格位置
                });
           
                scaleZControl.onChange((value) => {
                    input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
                    scaleControl.scaleZ = value; // 更新 scaleControl 的值
                    updateBoxHelper(); // 更新包圍盒助手
                    scaleZControl.updateDisplay(); // Update the GUI display
                    updateHelpers(); // 更新網格位置
                });
        
        
        
        
        
        
                Scale_control.add({
                    resetScale: () => {
                        input_model.scale.copy(defaultScale); // Reset the model scale to default
               
                        // 更新所有縮放控制的值
                        scaleControl.scaleX = defaultScale.x;
                        scaleControl.scaleY = defaultScale.y;
                        scaleControl.scaleZ = defaultScale.z;
               
                        // 設置 uniformScale 為 1
                        scaleControl.uniformScale = 1;
               
                        // 更新 GUI 控件
                        scaleXControl.setValue(defaultScale.x);
                        scaleYControl.setValue(defaultScale.y);
                        scaleZControl.setValue(defaultScale.z);
                        scaleXControl.updateDisplay();
                        scaleYControl.updateDisplay();
                        scaleZControl.updateDisplay();
               
                        // 直接使用 uniformScaleControl
                uniformScaleControl.setValue(1); // 設置為 1
                uniformScaleControl.updateDisplay(); // 更新顯示
               
                        updateBoxHelper(); // 更新包圍盒助手
                        updateHelpers(); // 更新網格位置
                        console.log("Scale reset to default:", defaultScale);
                    }
                }, 'resetScale').name('Reset Scale');
        
        
                // Show the GUI
                gui.domElement.style.display = 'block';            
                    },
                    (xhr) => {
                        const progressBar = document.getElementById('progress-bar');
                        if (xhr.lengthComputable) {
                            const percentComplete = (xhr.loaded / xhr.total) * 100;
                            progressBar.value = percentComplete;
                        }
                    },
                    (error) => {
                        console.error('Error loading model:', error);
                    }
                   
                );
        
}
else {
        console.error('Unsupported file format:', fileExtension);
    }

// if 判斷 .glb 和 .gltf 完結   
    };



    // Button and file input handling
    const loadModelBtn = document.getElementById('myButton');
    const modelFileInput = document.getElementById('model-file-input');

    // loadModelBtn.addEventListener('click', () => {
    //     modelFileInput.click(); // Trigger the file input when the button is clicked
    // });

    modelFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            loadModel(file);
        }
        // for(const file of event.target.files){
        //     loadModel(file);
        // }
    });

//------
// Open modal when button is clicked
loadModelBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Prevents default action, in case it's triggering file input
    modal.style.display = "block"; // Show the modal
});

// Close modal when the close button is clicked
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks the "Choose a file" button in the modal
uploadButton.onclick = function() {
    fileInputModal.click();
}

// Handle file upload from the modal
fileInputModal.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Show progress bar and hide navbar
        progressBarContainer.style.display = "flex"; // Assuming you want to show it
        // navbar.style.display = "none"; // Hide navbar during upload
        navbar.classList.add('hidden'); // Hide navbar during upload
        loadModel(file);
        modal.style.display = "none"; // Close the modal after choosing a file
    }
});

// Drag and drop functionality
const dropArea = document.getElementById("dropArea");
dropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
        loadModel(file);
        modal.style.display = "none"; // Close the modal after dropping a file
    }
});


//
    const autoRotate = { rotate: false };
    const Auto_Rotate = gui.addFolder("Auto Rotate").close();
    Auto_Rotate.add(autoRotate, "rotate").name("Auto Rotate").onChange((value) => {
        controls.autoRotate = value; // Enable or disable auto-rotation based on checkbox
    });

     // Add a control for auto-rotate speed
     const speedControl = { speed: controls.autoRotateSpeed };
     Auto_Rotate.add(speedControl, "speed", 0, 20).name("Auto Rotate Speed").onChange((value) => {
         controls.autoRotateSpeed = value; // Update the auto-rotate speed
     });

    // Start animation loop
    animate();
}

// function 集中地


// let step = 0;

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    // step += 0.02;
    // input_model.position.y = 2*Math.abs(Math.sin(step));
    // console.log(Math.abs(Math.sin(step)));
    controls.update(); // Update controls to apply autorotation if enabled
    renderer.render(scene, camera);
    stats.update();  // Update stats only if visible
}

const updateCamera = () => {
    camera.updateProjectionMatrix();
}
// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    updateCamera(); // camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.onload = init;