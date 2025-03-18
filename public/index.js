// import * as THREE from '/build/three.module.js';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader.js";

// create a THREE.JS Scene
const scene = new THREE.Scene();

let spotLightHelper1; 
let spotLightHelper2; 
let defaultScale; 
let scaleXControl, scaleYControl, scaleZControl;
let defaultCameraPosition;
let camerapositionControl;
// let renderer;
const renderer =  new THREE.WebGLRenderer({
    antialias: true, 
    alpha: false,
    powerPreference: "high-performance", // 優先使用高性能模式
    // canvas: model_container
});
window.renderer = renderer;
window.scene = scene;

let scaleControl; 
// let camera;

let object;
let controls;
let objToRender = "example";
let input_model;

// create a new camera with positions and angle
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
window.camera = camera;
// const gui = new GUI();

// 全局 GUI 實例，初始打開
const gui = new GUI();
window.gui = gui; // 暴露給 client.js 使用
gui.domElement.style.display = 'block'; // 初始顯示 GUI
gui.open(); // 初始打開 GUI

// 定義全局收起函數
window.closeGUI = function() {
    gui.close(); // 收起 GUI
    gui.domElement.style.display = 'none'; // 隱藏 GUI
    resetGUI(); // 重置 GUI 狀態
};


// 加入背顏色 (2D,3D背景有用)
const params = {
    color: '#000000', // Default background color
    backgroundImage: '', // Default background image URL
    showStats: false,
    autoRotate: false
};

window.resetGUI = function() {
    params.showStats = false;
    params.autoRotate = false;
    stats.domElement.style.display = 'none';
    controls.autoRotate = false;
    controls.update();
};

gui.domElement.style.display = 'block'; // Hide the GUI by default
gui.close(); // Close the GUI by default
const statsControl = { showStats: false };
    gui.add(statsControl, "showStats").name("Show Stats").onChange((value) => {
        stats.domElement.style.display = value ? 'block' : 'none'; // Show or hide stats
    });

    const background_change = gui.addFolder("Background").close();

     // background color
        background_change.addColor(params, 'color').name('Background Color').onChange((value) => {
            if (!params.backgroundImage) {
                scene.background = new THREE.Color(value); // Update the scene background color
            }
        });
    
        //Add a text input to set the background image URL
        // background_change.add(params, 'backgroundImage').name('Background Image URL').onChange((value) => {
        //     if (value) {
        //         const textureLoader = new THREE.TextureLoader();
        //         textureLoader.load(value, (texture) => {
        //             scene.background = texture; // Update the scene background to the texture
        //         });
        //     }
        // });

         background_change.add(params, 'backgroundImage').name('Background Image URL').onChange((value) => {
                // 找到 "Background Image URL" 控制器的父容器
                const controllerDiv = Array.from(document.querySelectorAll('.lil-gui')).find(div =>
                    div.textContent.includes('Background Image URL')
                );
                const inputElement = controllerDiv ? controllerDiv.querySelector('input') : null;
            
                if (!inputElement) {
                    console.error('Input element for "Background Image URL" not found');
                    return; // 防止進一步錯誤
                }
            
                // 獲取獨立的錯誤提示元素
                const errorHint = document.getElementById('error-hint');
                if (!errorHint) {
                    console.error('Error hint element (#error-hint) not found in DOM');
                    return;
                }
            
                // 不再需要動態計算位置，因為 CSS 已將其固定在畫面中間
                // 移除以下代碼：
                // const inputRect = inputElement.getBoundingClientRect();
                // errorHint.style.left = `${inputRect.left}px`;
                // errorHint.style.top = `${inputRect.bottom + 5}px`;
            
                // 處理空輸入的情況
                if (!value || value.trim() === '') {
                    errorHint.textContent = ''; // 清空提示
                    errorHint.style.display = 'none'; // 隱藏提示
                    console.log('Input is empty, hint cleared');
                    return; // 提前返回，不進行後續檢查
                }
            
                // 使用全局 validator 驗證 URL
                        if (validator.isURL(value, { protocols: ['https'], require_protocol: true })) {
                            const textureLoader = new THREE.TextureLoader();
                            textureLoader.load(value, (texture) => {
                                scene.background = texture; // 更新背景
                                errorHint.textContent = ''; // 清空提示
                                errorHint.style.display = 'none'; // 隱藏提示
                                console.log('Background updated, hint cleared');
                            }, undefined, (error) => {
                                console.error('Error loading texture:', error);
                                errorHint.textContent = 'An error occurred. Please enter a valid URL'; //Failed to load backgroung image: Please enter a valid HTTPS URL
                                errorHint.style.display = 'block'; // 顯示提示
                                console.log('Error hint set to "Failed to load image"');
                            });
                        } else {
                            console.error('Invalid URL');
                            errorHint.textContent = 'An error occurred. Please enter a valid URL'; // 設置錯誤提示 //Background image: Please enter a valid HTTPS URL
                            errorHint.style.display = 'block'; // 顯示提示
                            console.log('Error hint set to "此輸入框不對的"');
                        }
                    });

    // 處理窗口調整時重新定位錯誤提示
    window.addEventListener('resize', () => {
        const errorHint = document.getElementById('error-hint');
        const controllerDiv = Array.from(document.querySelectorAll('.lil-gui')).find(div =>
            div.textContent.includes('Background Image URL')
        );
        const inputElement = controllerDiv ? controllerDiv.querySelector('input') : null;
    
        if (errorHint && inputElement && errorHint.style.display !== 'none') {
            // 重新計算位置（這裡僅為示例，實際可能不需要）
        // errorHint.style.top = '90%';
        // // errorHint.style.right = '2%';
        // errorHint.style.left = '50%';
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/octet-stream']; // HDR 可能為二進位流
    if (file && !allowedTypes.includes(file.type)) {
        alert('Unsupported file type. Please upload .jpg, .jpeg, .png, or .hdr files.');
        event.target.value = ''; // 清空輸入
        return;
    }
    else if (file) {
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

const camera_position = gui.addFolder("Camera").close();
    // Get the default camera position of the model
    defaultCameraPosition = camera.position.clone();

    camerapositionControl = {
        x: defaultCameraPosition.x,
        y: defaultCameraPosition.y,
        // z: defaultCameraPosition.z // 10
        z: 10 // 10
    };


    const camerapositionXControl = camera_position.add(camerapositionControl, 'x', -10, 10, 0.1).name(`x`);
    const camerapositionYControl = camera_position.add(camerapositionControl, 'y', -8, 8, 0.1).name(`y`);
    const camerapositionZControl = camera_position.add(camerapositionControl, 'z', 1, 20, 0.1).name(`z`);


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
    // camerapositionXControl.setValue(defaultCameraPosition.x); // Update GUI control
    camerapositionXControl.setValue(0);
    camerapositionXControl.updateDisplay(); // Update the GUI display
    // camerapositionYControl.setValue(defaultCameraPosition.y); // Update GUI control
    camerapositionYControl.setValue(0);
    camerapositionYControl.updateDisplay(); // Update the GUI display
    // camerapositionZControl.setValue(defaultCameraPosition.z); // Update GUI control
    camerapositionZControl.setValue(10);
    camerapositionZControl.updateDisplay(); // Update the GUI display
    // console.log("Scale reset to default:", defaultCameraPosition );
    }}, 'resetPosition').name('Reset Position');

    // renderer = new THREE.WebGLRenderer({
    //     antialias: true, 
    //     alpha: false,
    //     // powerPreference: "high-performance", // 優先使用高性能模式
    //     // canvas: model_container
    // });
    // renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    
    controls.autoRotate = false; // Initially set to false
    controls.autoRotateSpeed = 5.0; // Set the speed of auto-rotation

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

//-------
camera.position.set(0, 0, 10); // 設置相機位置

const stats = new Stats();
document.body.appendChild(stats.domElement);
stats.domElement.style.display = 'none'; // Hide stats by default



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
                input_model.position.set(0, -4, 0);
                input_model.scale.set(0.3, 0.3, 0.3); // 將模型縮放到原來的0.13%
                input_model.rotation.x = Math.PI / -3;

                // 創建包圍盒
                    const box = new THREE.Box3().setFromObject(input_model);
                    // const modelHeight = box.max.y - box.min.y; // 計算模型的高度
                    // 計算模型的底部位置，使其位於網格上方
                    const offset = 1.00; // 調整這個值以減少高度
                
                scene.add(gltf.scene);

                // 紀錄初始位置
        initialPosition = input_model.position.clone();

        const boxHelper = new THREE.Box3Helper(box, 0xffff00); // 0xffff00 是黃色
            // scene.add(boxHelper); // 初始時加包圍盒助手
        
            // 將包圍盒助手添加到場景中
            // scene.add(boxHelper);
            const axesHelper = new THREE.AxesHelper( 200 );
            axesHelper.position.y = box.min.y ; // 確保輔助軸與網格對齊
            axesHelper.visible = false; // 初始設置為隱藏
            scene.add( axesHelper );
        
            // 創建 GridHelper
        const gridHelper = new THREE.GridHelper(100, 50); // 100 為大小，50 為細分數量
        gridHelper.position.y = box.min.y; // 將網格放置在模型下方
        gridHelper.visible = false; // 初始設置為隱藏
        scene.add(gridHelper);

        //-
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


     // 更新幫助器位置的函數
     function updateHelpers() {
        const box = new THREE.Box3().setFromObject(input_model); // 更新包圍盒
        const center = box.getCenter(new THREE.Vector3()); // Get the center of the bounding box

        boxHelper.box = box; // 更新包圍盒助手的包圍盒
        axesHelper.position.y = box.min.y; // 更新輔助軸位置
        gridHelper.position.y = box.min.y; // 更新網格位置

        // Update the GridHelper position to follow the model in x, y, z
        gridHelper.position.set(center.x, box.min.y, center.z); // Center in x and z, bottom in y
        axesHelper.position.set(center.x, box.min.y, center.z);
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
    const posXControl = positionControl.add(positionControlValues, 'posX', -10, 10, 0.1).name('Position X');
    const posYControl = positionControl.add(positionControlValues, 'posY', -10, 10, 0.1).name('Position Y');
    const posZControl = positionControl.add(positionControlValues, 'posZ', -10, 10, 0.1).name('Position Z');
    
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
            input_model.position.set(0, -1.9, 0); // Reset to initial position
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
                        uniformScale: 0.3 //新增的屬性
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
            
                    // 設置 uniformScale 為 0.3
                    scaleControl.uniformScale = 0.3;
            
                    // 更新 GUI 控件
                    scaleXControl.setValue(defaultScale.x); 
                    scaleYControl.setValue(defaultScale.y); 
                    scaleZControl.setValue(defaultScale.z); 
                    scaleXControl.updateDisplay(); 
                    scaleYControl.updateDisplay(); 
                    scaleZControl.updateDisplay(); 
            
                    // 直接使用 uniformScaleControl
            uniformScaleControl.setValue(0.12); // 設置為 0.13
            uniformScaleControl.updateDisplay(); // 更新顯示
            
                    updateBoxHelper(); // 更新包圍盒助手
                    updateHelpers(); // 更新網格位置
                    console.log("Scale reset to default:", defaultScale);
                }
            }, 'resetScale').name('Reset Scale');
    
            // Show the GUI
            gui.domElement.style.display = 'block';

        //-

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


renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// controls = new OrbitControls(camera, renderer.domElement);

// camera.position.z = example === "example" ? 25 : 500;

const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color,intensity)
topLight.position.set(200,200,200); // top-left-ish
// topLight.castShadow = true;
scene.add(topLight);

// const ambientLight = new THREE.AmbientLight(0xffffff, 10); // 將強度設置為 10
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
spotLight1.position.set(5, 5, 5);
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
Front_Light.add(spotLight1.position, 'x', -5, 5, 1).onChange(() => {
    spotLightHelper1.update();
});
Front_Light.add(spotLight1.position, 'y', -5, 5, 1).onChange(() => {
    spotLightHelper1.update();
});
Front_Light.add(spotLight1.position, 'z', -5, 5, 1).onChange(() => {
    spotLightHelper1.update();
});

// Create SpotLight2 and control its visibility and properties
const spotLight2 = new THREE.SpotLight(0xffffff, 0); // 初始強度為 0
spotLight2.position.set(-5, -5, -5);
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
Back_Light.add(spotLight2.position, 'x', -5, 5, 1).onChange(() => {
    spotLightHelper2.update();
});
Back_Light.add(spotLight2.position, 'y', -5, 5, 1).onChange(() => {
    spotLightHelper2.update();
});
Back_Light.add(spotLight2.position, 'z', -5, 5, 1).onChange(() => {
    spotLightHelper2.update();
});
//


let step = 0;

let needsRender = true; // 標記是否需要渲染



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

    // 更新控制器以支持自動旋轉
    if (controls.autoRotate) {
        controls.update();
    }

        controls.update();
        renderer.render(scene, camera);
        stats.update();
        needsRender = false; // 重置標記

    // stats.update();
    
    // renderer.render(scene, camera);
    

}

window.addEventListener("resize", function(){
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(this.window.innerWidth, this.window.innerHeight);
});

// 當有模型變化或用戶交互時，設置 needsRender = true
// window.addEventListener('mousemove', () => {
//     needsRender = true;
// });

// Start the 3D rendering
// animate();