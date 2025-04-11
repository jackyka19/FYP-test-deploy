// import * as THREE from '/build/three.module.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Create a THREE.JS Scene
const scene = new THREE.Scene();

let spotLightHelper1;
let spotLightHelper2;
let defaultScale;
let scaleXControl, scaleYControl, scaleZControl;
let defaultCameraPosition;
let camerapositionControl;

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
});
window.renderer = renderer;
window.scene = scene;

let scaleControl;
let object;
let controls;
let objToRender = "example";
let input_model;

// Create a new camera with positions and angle
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
window.camera = camera;

// 全局 GUI 實例，初始打開
const gui = new GUI();
window.gui = gui;
gui.domElement.style.display = 'block';
// gui.open();
gui.close();

// 定義全局收起函數
window.closeGUI = function () {
    gui.close();
    gui.domElement.style.display = 'none';
    resetGUI();
};

// 全局變量，用於保存控制器引用
let showAxesController, showBoxHelperController, showGridController;

// 加入背景顏色 (2D, 3D 背景有用)
const params = {
    color: '#000000',


    backgroundImage: '',
    showStats: false,
    autoRotate: false,
    showBoxHelper: false,
    showAxes: false,
    showGrid: false,
    scale: 1,
    positionY: 0
};

window.resetGUI = function () {
    params.showStats = false;
    params.autoRotate = false;
    stats.domElement.style.display = 'none';
    controls.autoRotate = false;
    controls.update();

    // 收起所有 GUI 文件夾
    // Object.values(gui.__folders).forEach(folder => {
    //     folder.close();
    // });
};

// 頂層 GUI 控件：Show Stats
const statsControl = { showStats: false };
gui.add(statsControl, "showStats").name("Show Stats").onChange((value) => {
    stats.domElement.style.display = value ? 'block' : 'none';
});

// 頂層 GUI 控件：Background
const background_change = gui.addFolder("Background").close();
background_change.addColor(params, 'color').name('Background Color').onChange((value) => {
    if (!params.backgroundImage) {
        scene.background = new THREE.Color(value);
    }
});
background_change.add(params, 'backgroundImage').name('Background Image URL').onChange((value) => {
    const controllerDiv = Array.from(document.querySelectorAll('.lil-gui')).find(div =>
        div.textContent.includes('Background Image URL')
    );
    const inputElement = controllerDiv ? controllerDiv.querySelector('input') : null;

    if (!inputElement) {
        console.error('Input element for "Background Image URL" not found');
        return;
    }

    const errorHint = document.getElementById('error-hint');
    if (!errorHint) {
        console.error('Error hint element (#error-hint) not found in DOM');
        return;
    }

    if (!value || value.trim() === '') {
        errorHint.textContent = '';
        errorHint.style.display = 'none';
        console.log('Input is empty, hint cleared');
        return;
    }

    if (validator.isURL(value, { protocols: ['https'], require_protocol: true })) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(value, (texture) => {
            scene.background = texture;
            errorHint.textContent = '';
            errorHint.style.display = 'none';
            console.log('Background updated, hint cleared');
        }, undefined, (error) => {
            console.error('Error loading texture:', error);
            errorHint.textContent = 'An error occurred. Please enter a valid URL';
            errorHint.style.display = 'block';
            console.log('Error hint set to "Failed to load image"');
        });
    } else {
        console.error('Invalid URL');
        errorHint.textContent = 'An error occurred. Please enter a valid URL';
        errorHint.style.display = 'block';
        console.log('Error hint set to "Invalid input in this field"');
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
    }
});

// Create an input for uploading 2D or 3D images
const uploadInput = document.createElement('input');
uploadInput.type = 'file';
uploadInput.accept = '.hdr,.jpg,.jpeg,.png';
uploadInput.style.display = 'none';
document.body.appendChild(uploadInput);

background_change.add({ upload: () => uploadInput.click() }, 'upload').name('Upload Image');

uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/octet-stream'];
    if (file && !allowedTypes.includes(file.type)) {
        alert('Unsupported file type. Please upload .jpg, .jpeg, .png, or .hdr files.');
        event.target.value = '';
        return;
    } else if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const blob = new Blob([e.target.result], { type: file.type });
            const url = URL.createObjectURL(blob);

            scene.background = null;

            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'hdr') {
                const rgbeLoader = new RGBELoader();
                rgbeLoader.load(url, (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    scene.background = texture;
                    params.color = '#ffffff';
                    URL.revokeObjectURL(url);
                });
            } else if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png') {
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(url, (texture) => {
                    scene.background = texture;
                    params.color = '#ffffff';
                    URL.revokeObjectURL(url);
                });
            } else {
                console.error('Unsupported file type');
            }
        };
        reader.readAsArrayBuffer(file);
    }
});

// 頂層 GUI 控件：Texture
const texture_change = gui.addFolder("Texture").close();
const textureInput = document.createElement('input');
textureInput.type = 'file';
textureInput.accept = '.jpg,.jpeg,.png';
textureInput.style.display = 'none';
document.body.appendChild(textureInput);

texture_change.add({ uploadTexture: () => textureInput.click() }, 'uploadTexture').name('Upload Texture');

textureInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(URL.createObjectURL(file), (texture) => {
                if (input_model) {
                    input_model.traverse((child) => {
                        if (child.isMesh) {
                            child.material.map = texture;
                            child.material.needsUpdate = true;
                        }
                    });
                }
            });
        };
        reader.readAsDataURL(file);
    }
});

// 頂層 GUI 控件：Camera
const camera_position = gui.addFolder("Camera").close();
defaultCameraPosition = camera.position.clone();

camerapositionControl = {
    x: defaultCameraPosition.x,
    y: defaultCameraPosition.y,
    z: 10
};
const camerapositionXControl = camera_position.add(camerapositionControl, 'x', -30, 30, 0.1).name(`x`);
const camerapositionYControl = camera_position.add(camerapositionControl, 'y', -30, 30, 0.1).name(`y`);
const camerapositionZControl = camera_position.add(camerapositionControl, 'z', -30, 30, 0.1).name(`z`);

camerapositionXControl.onChange((value) => {
    camera.position.set(value, camera.position.y, camera.position.z);
    camerapositionXControl.updateDisplay();
});
camerapositionYControl.onChange((value) => {
    camera.position.set(camera.position.x, value, camera.position.z);
    camerapositionXControl.updateDisplay();
});
camerapositionZControl.onChange((value) => {
    camera.position.set(camera.position.x, camera.position.y, value);
    camerapositionZControl.updateDisplay();
});
camera_position.add({
    resetPosition: () => {
        camera.position.copy(defaultCameraPosition);
        camerapositionXControl.setValue(0);
        camerapositionXControl.updateDisplay();
        camerapositionYControl.setValue(0);
        camerapositionYControl.updateDisplay();
        camerapositionZControl.setValue(10);
        camerapositionZControl.updateDisplay();
    }
}, 'resetPosition').name('Reset Position');

// 設置相機初始位置
camera.position.set(0, 0, 10);


// 創建 OrbitControls
controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = false;
controls.autoRotateSpeed = 5.0;

// 頂層 GUI 控件：Auto Rotate
const autoRotate = { rotate: false };
const Auto_Rotate = gui.addFolder("Auto Rotate").close();
Auto_Rotate.add(autoRotate, "rotate").name("Auto Rotate").onChange((value) => {
    controls.autoRotate = value;
});
const speedControl = { speed: controls.autoRotateSpeed };
Auto_Rotate.add(speedControl, "speed", 0, 20).name("Auto Rotate Speed").onChange((value) => {
    controls.autoRotateSpeed = value;
});

// 創建 Stats
const stats = new Stats();
document.body.appendChild(stats.domElement);
stats.domElement.style.display = 'none';

// 創建 GLTFLoader
const loader = new GLTFLoader();

let isAnimating = false;
const duration = 5000;
let startTime = null;
let initialPosition;

// 定義三個預設模型的路徑
const defaultModels = {
    model1: './model/scene.glb',
    model2: './model_two/dancing_stormtrooper.glb', //model2: './model_two/residential_garage_pack_-_1mb.glb',
    model3: './model_three/oiiaioooooiai_cat.glb'
};

// 定義每個模型的預設參數
let modelSettings = {
    model1: {
        // position: { x: 0, y: -5, z: -10 }, // 模型 1 的預設位置
        position: { x: 0, y: 1.5, z: 0 }, // 模型 1 的預設位置
        scale: { x: 0.2, y: 0.2, z: 0.3 }, // 模型 1 的預設縮放
        // camera: { x: 0, y: 0, z: 15 }, // 模型 1 的預設相機位置
        // rotation: { x: Math.PI / -3, y: 0, z: 0 } // 模型 1 的預設旋轉
        // rotation: { x: -1, y: 1, z: 0 } 
    },
    model2: {
        // position: { x: 2, y: -25, z: 2 }, // 模型 2 的預設位置
        position: { x: 0, y: 0, z: 0 }, // 模型 2 的預設位置
        scale: { x: 1.5, y: 1.5, z: 1.5 }, // 模型 2 的預設縮放
        // camera: { x: 2, y: -16.5, z: 17.5 }, // 模型 2 的預設相機位置
        // rotation: { x: Math.PI / -4, y: Math.PI / 4, z: 0 } // 模型 2 的預設旋轉
    },
    model3: {
        // position: { x: 2, y: -5, z: -2 }, // 模型 3 的預設位置
        position: { x: 0, y: 0, z: 0 }, // 模型 3 的預設位置
        scale: { x: 15, y: 15, z: 8.5 }, // 模型 3 的預設縮放
        // camera: { x: -3, y: -4, z: 9 }, // 模型 3 的預設相機位置
        // rotation: { x: Math.PI / -2, y: -Math.PI / 3, z: 0 } // 模型 3 的預設旋轉
    }
};

// 全局變量
let currentGltfScene = null;
let currentDefaultModel = 'model1';
let boxHelper, axesHelper, gridHelper;
let spotLight1, phongShaderMaterial, toonShaderMaterial, flatShaderMaterial, gouraudShaderMaterial;
let originalMaterials = new Map();

// 頂層 GUI 控件：Shading
const shadingParams = {
    shadingMode: 'None',
    shininess: 32.0,
    diffuseColor: '#aaaaaa',
    specularColor: '#ffffff'
};
const shadingModes = ['None', 'Flat', 'Gouraud', 'Phong', 'Toon'];
const shadingFolder = gui.addFolder('Shading').close();
shadingFolder.add(shadingParams, 'shadingMode', shadingModes).name('Shading Mode').onChange((value) => {
    if (input_model) {
        input_model.traverse((child) => {
            if (child.isMesh) {
                if (value === 'Phong') {
                    child.material = phongShaderMaterial;
                } else if (value === 'Toon') {
                    child.material = toonShaderMaterial;
                } else if (value === 'Flat') {
                    child.material = flatShaderMaterial;
                } else if (value === 'Gouraud') {
                    child.material = gouraudShaderMaterial;
                } else {
                    child.material = originalMaterials.get(child);
                }
                child.material.needsUpdate = true;
            }
        });
    }
});
shadingFolder.add(shadingParams, 'shininess', 1, 100).name('Shininess').onChange((value) => {
    if (phongShaderMaterial) phongShaderMaterial.uniforms.shininess.value = value;
    if (toonShaderMaterial) toonShaderMaterial.uniforms.shininess.value = value;
    if (flatShaderMaterial) flatShaderMaterial.uniforms.shininess.value = value;
    if (gouraudShaderMaterial) gouraudShaderMaterial.uniforms.shininess.value = value;
});
shadingFolder.addColor(shadingParams, 'diffuseColor').name('Diffuse Color').onChange((value) => {
    if (phongShaderMaterial) phongShaderMaterial.uniforms.diffuseColor.value.set(value);
    if (toonShaderMaterial) toonShaderMaterial.uniforms.diffuseColor.value.set(value);
    if (flatShaderMaterial) flatShaderMaterial.uniforms.diffuseColor.value.set(value);
    if (gouraudShaderMaterial) gouraudShaderMaterial.uniforms.diffuseColor.value.set(value);
});
shadingFolder.addColor(shadingParams, 'specularColor').name('Specular Color').onChange((value) => {
    if (phongShaderMaterial) phongShaderMaterial.uniforms.specularColor.value.set(value);
    if (toonShaderMaterial) toonShaderMaterial.uniforms.specularColor.value.set(value);
    if (flatShaderMaterial) flatShaderMaterial.uniforms.specularColor.value.set(value);
    if (gouraudShaderMaterial) gouraudShaderMaterial.uniforms.specularColor.value.set(value);
});

// 頂層 GUI 控件：Axes, Box, Grid Helper
const BoxHelper = gui.addFolder("Axes, Box, Grid Helper").close();
showAxesController = BoxHelper.add(params, 'showAxes').name('Show Axes').onChange((value) => {
    if (axesHelper) axesHelper.visible = value;
});
showBoxHelperController = BoxHelper.add(params, 'showBoxHelper').name('Show Box Helper').onChange((value) => {
    if (value && boxHelper) {
        scene.add(boxHelper);
    } else if (boxHelper) {
        scene.remove(boxHelper);
    }
});
showGridController = BoxHelper.add(params, 'showGrid').name('Show Grid').onChange((value) => {
    if (gridHelper) gridHelper.visible = value;
});
// BoxHelper.add(params, 'showAxes').name('Show Axes').onChange((value) => {
//     if (axesHelper) axesHelper.visible = value;
// });
// BoxHelper.add(params, 'showBoxHelper').name('Show Box Helper').onChange((value) => {
//     if (value && boxHelper) {
//         scene.add(boxHelper);
//     } else if (boxHelper) {
//         scene.remove(boxHelper);
//     }
// });
// BoxHelper.add(params, 'showGrid').name('Show Grid').onChange((value) => {
//     if (gridHelper) gridHelper.visible = value;
// });

// 頂層 GUI 控件：Position Control
const positionControlValues = {
    posX: 0,
    posY: 0,
    posZ: 0
};
const positionControl = gui.addFolder("Position Control").close();
const posXControl = positionControl.add(positionControlValues, 'posX', -30, 30, 0.1).name('Position X');
const posYControl = positionControl.add(positionControlValues, 'posY', -30, 30, 0.1).name('Position Y');
const posZControl = positionControl.add(positionControlValues, 'posZ', -30, 30, 0.1).name('Position Z');
posXControl.onChange((value) => {
    if (input_model) {
        input_model.position.x = value;
        updateHelpers();
    }
});
posYControl.onChange((value) => {
    if (input_model) {
        input_model.position.y = value;
        updateHelpers();
    }
});
posZControl.onChange((value) => {
    if (input_model) {
        input_model.position.z = value;
        updateHelpers();
    }
});
// positionControl.add({
//     resetPosition: () => {
//         if (input_model) {
//             let settings = modelSettings[currentDefaultModel]; // 使用當前模型的預設位置
//             input_model.position.set(
//                 settings.position.x,
//                 settings.position.y,
//                 settings.position.z
//             );
//             positionControlValues.posX = input_model.position.x;
//             positionControlValues.posY = input_model.position.y;
//             positionControlValues.posZ = input_model.position.z;
//             posXControl.updateDisplay();
//             posYControl.updateDisplay();
//             posZControl.updateDisplay();
//             updateBoxHelper();
//             updateHelpers();
//         }
//     }
// }, 'resetPosition').name('Reset Position');
// 修改 Position Control 的 resetPosition 函數
positionControl.add({
    resetPosition: () => {
        if (input_model) {
            let settings = modelSettings[currentDefaultModel];
            input_model.position.set(
                settings.position.x,
                settings.position.y,
                settings.position.z
            );

            // 重新計算模型的幾何中心
            const box = new THREE.Box3().setFromObject(input_model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // 計算相機的 Z 軸位置，確保模型居中
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

            // 設置相機位置
            camera.position.set(center.x, center.y, center.z + cameraZ);

            // 設置 OrbitControls 的目標為模型中心
            controls.target.copy(center);
            controls.update();

            // 更新 GUI 的 Position Control 值
            positionControlValues.posX = input_model.position.x;
            positionControlValues.posY = input_model.position.y;
            positionControlValues.posZ = input_model.position.z;
            posXControl.setValue(input_model.position.x);
            posYControl.setValue(input_model.position.y);
            posZControl.setValue(input_model.position.z);
            posXControl.updateDisplay();
            posYControl.updateDisplay();
            posZControl.updateDisplay();

            // 更新 GUI 的 Camera Control 值
            camerapositionControl.x = camera.position.x;
            camerapositionControl.y = camera.position.y;
            camerapositionControl.z = camera.position.z;
            camerapositionXControl.setValue(camera.position.x);
            camerapositionYControl.setValue(camera.position.y);
            camerapositionZControl.setValue(camera.position.z);
            camerapositionXControl.updateDisplay();
            camerapositionYControl.updateDisplay();
            camerapositionZControl.updateDisplay();

            updateBoxHelper();
            updateHelpers();
        }
    }
}, 'resetPosition').name('Reset Position');

// 添加一個新的按鈕，用於恢復到初始調整後的位置（居中位置）
positionControl.add({
    resetToCentered: () => {
        if (input_model) {
            // 恢復到初始調整後的位置（居中位置）
            input_model.position.copy(initialAdjustedPosition);

            // 重新計算模型的幾何中心
            const box = new THREE.Box3().setFromObject(input_model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // 計算相機的 Z 軸位置，確保模型居中
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

            // 設置相機位置
            camera.position.set(center.x, center.y, center.z + cameraZ);

            // 設置 OrbitControls 的目標為模型中心
            controls.target.copy(center);
            controls.update();

            // 更新 GUI 的 Position Control 值
            positionControlValues.posX = input_model.position.x;
            positionControlValues.posY = input_model.position.y;
            positionControlValues.posZ = input_model.position.z;
            posXControl.setValue(input_model.position.x);
            posYControl.setValue(input_model.position.y);
            posZControl.setValue(input_model.position.z);
            posXControl.updateDisplay();
            posYControl.updateDisplay();
            posZControl.updateDisplay();

            // 更新 GUI 的 Camera Control 值
            camerapositionControl.x = camera.position.x;
            camerapositionControl.y = camera.position.y;
            camerapositionControl.z = camera.position.z;
            camerapositionXControl.setValue(camera.position.x);
            camerapositionYControl.setValue(camera.position.y);
            camerapositionZControl.setValue(camera.position.z);
            camerapositionXControl.updateDisplay();
            camerapositionYControl.updateDisplay();
            camerapositionZControl.updateDisplay();

            updateBoxHelper();
            updateHelpers();
        }
    }
}, 'resetToCentered').name('Reset to Centered');

// 頂層 GUI 控件：Scale Control
scaleControl = {
    scaleX: 0.3,
    scaleY: 0.3,
    scaleZ: 0.3,
    uniformScale: 0.3
};
const Scale_control = gui.addFolder("Scale Control").close();
scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.1, 10).name('Scale X');
scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.1, 10).name('Scale Y');
scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.1, 10).name('Scale Z');
const uniformScaleControl = Scale_control.add(scaleControl, 'uniformScale', 0.1, 10).name('Uniform Scale').onChange(value => {
    if (input_model) {
        input_model.scale.set(value, value, value);
        scaleControl.scaleX = value;
        scaleControl.scaleY = value;
        scaleControl.scaleZ = value;
        scaleXControl.setValue(value);
        scaleYControl.setValue(value);
        scaleZControl.setValue(value);
        scaleXControl.updateDisplay();
        scaleYControl.updateDisplay();
        scaleZControl.updateDisplay();
        updateBoxHelper();
        updateHelpers();
    }
});
scaleXControl.onChange((value) => {
    if (input_model) {
        input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
        scaleControl.scaleX = value;
        updateBoxHelper();
        scaleXControl.updateDisplay();
        updateHelpers();
    }
});
scaleYControl.onChange((value) => {
    if (input_model) {
        input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
        scaleControl.scaleY = value;
        updateBoxHelper();
        scaleYControl.updateDisplay();
        updateHelpers();
    }
});
scaleZControl.onChange((value) => {
    if (input_model) {
        input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
        scaleControl.scaleZ = value;
        updateBoxHelper();
        scaleZControl.updateDisplay();
        updateHelpers();
    }
});
Scale_control.add({
    resetScale: () => {
        if (input_model) {
            const settings = modelSettings[currentDefaultModel]; // 使用當前模型的預設縮放
            input_model.scale.set(
                settings.scale.x,
                settings.scale.y,
                settings.scale.z
            );
            scaleControl.scaleX = settings.scale.x;
            scaleControl.scaleY = settings.scale.y;
            scaleControl.scaleZ = settings.scale.z;
            scaleControl.uniformScale = settings.scale.x;
            scaleXControl.setValue(settings.scale.x);
            scaleYControl.setValue(settings.scale.y);
            scaleZControl.setValue(settings.scale.z);
            uniformScaleControl.setValue(settings.scale.x);
            scaleXControl.updateDisplay();
            scaleYControl.updateDisplay();
            scaleZControl.updateDisplay();
            uniformScaleControl.updateDisplay();
            updateBoxHelper();
            updateHelpers();
        }
    }
}, 'resetScale').name('Reset Scale');

// 設置渲染器大小
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// 創建燈光
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(200, 200, 200);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

// 頂層 GUI 控件：Ambient Light
const ambientLightFolder = gui.addFolder("Ambient Light").close();
const DEFAULT_INTENSITY = 5;
const DEFAULT_COLOR = '#ffffff';
const ambientLightControls = {
    intensity: DEFAULT_INTENSITY,
    color: DEFAULT_COLOR,
    isEnabled: true,
    reset: function () {
        ambientLight.intensity = DEFAULT_INTENSITY;
        intensityController.setValue(DEFAULT_INTENSITY);
        intensityController.updateDisplay();
    },
    resetColor: function () {
        ambientLight.color.set(DEFAULT_COLOR);
        colorController.setValue(DEFAULT_COLOR);
        colorController.updateDisplay();
    }
};
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
ambientLightFolder.add(ambientLightControls, 'isEnabled').name('Ambient Light').onChange((value) => {
    ambientLight.visible = value;
});
ambientLightFolder.add(ambientLightControls, 'reset').name('Reset Intensity');
ambientLightFolder.add(ambientLightControls, 'resetColor').name('Reset Color');

// 創建 Spotlight 1
spotLight1 = new THREE.SpotLight(0xffffff, 0);
spotLight1.position.set(5, 5, 5);
scene.add(spotLight1);
spotLightHelper1 = new THREE.SpotLightHelper(spotLight1, 1, 0xffffff);

// 頂層 GUI 控件：Spotlight 1
const lightHelperControl1 = { showHelpers: false, isEnabled: false };
const Front_Light = gui.addFolder("Spotlight 1").close();
Front_Light.add(lightHelperControl1, 'isEnabled').name('Spotlight 1').onChange((value) => {
    spotLight1.visible = value;
    spotLight1.intensity = value ? 500 : 0;
});
Front_Light.add(lightHelperControl1, "showHelpers").name("Show Spotlight 1 Helpers").onChange((value) => {
    if (value) {
        scene.add(spotLightHelper1);
    } else {
        scene.remove(spotLightHelper1);
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

// 創建 Spotlight 2
const spotLight2 = new THREE.SpotLight(0xffffff, 0);
spotLight2.position.set(-5, -5, -5);
scene.add(spotLight2);
spotLightHelper2 = new THREE.SpotLightHelper(spotLight2, 1, 0xffffff);

// 頂層 GUI 控件：Spotlight 2
const lightHelperControl2 = { showHelpers: false, isEnabled: false };
const Back_Light = gui.addFolder("Spotlight 2").close();
Back_Light.add(lightHelperControl2, 'isEnabled').name('Spotlight 2').onChange((value) => {
    spotLight2.visible = value;
    spotLight2.intensity = value ? 500 : 0;
});
Back_Light.add(lightHelperControl2, "showHelpers").name("Show Spotlight 2 Helpers").onChange((value) => {
    if (value) {
        scene.add(spotLightHelper2);
    } else {
        scene.remove(spotLightHelper2);
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

// 在全局變量中添加一個變量來保存初始調整後的位置
let initialAdjustedPosition;

// 加載預設模型的函數
function loadDefaultModel(modelKey) {

    // 顯示「Loading...」提示
    const loadingText = document.getElementById('loading-text');
    const progressBar = document.getElementById('progress-bar');
    const loadingLabel = document.getElementById('loading-label'); // 獲取 Welcome 標籤
    loadingText.style.display = 'block'; // 顯示「Loading...」
    // progressBar.style.display = 'block'; // 顯示進度條（可選）
    loadingLabel.style.display = 'block'; // 確保 Welcome 標籤初始顯示

    // 移除當前模型（如果存在）
    if (currentGltfScene) {
        scene.remove(currentGltfScene);
        currentGltfScene = null;
    }
    if (input_model) {
        input_model = null;
    }

    // 移除舊的輔助器（如果存在）
    if (axesHelper) {
        scene.remove(axesHelper);
        axesHelper = null;
    }
    if (boxHelper) {
        scene.remove(boxHelper);
        boxHelper = null;
    }
    if (gridHelper) {
        scene.remove(gridHelper);
        gridHelper = null;
    }

    
    // 重置 GUI 選項
    params.showAxes = false;
    params.showBoxHelper = false;
    params.showGrid = false;

    // 立即更新 GUI 顯示
    showAxesController.setValue(false);
    showAxesController.updateDisplay();
    showBoxHelperController.setValue(false);
    showBoxHelperController.updateDisplay();
    showGridController.setValue(false);
    showGridController.updateDisplay();



    // 更新當前模型標識
    currentDefaultModel = modelKey;

    // 獲取當前模型的預設參數
    const settings = modelSettings[modelKey];

    loader.load(
        defaultModels[modelKey],
        (gltf) => {

            // 模型加載完成，隱藏「Loading...」提示和進度條
            loadingText.style.display = 'none';
            // progressBar.style.display = 'none';
            // loadingLabel.style.display = 'none'; // 隱藏「Welcome! Import your 3D file here」

            currentGltfScene = gltf.scene;
            input_model = gltf.scene;
            // input_model = gltf.scene.children[0];

            // 應用預設位置
            // input_model.position.set(
            //     settings.position.x,
            //     settings.position.y,
            //     settings.position.z
            // );
            // console.log(camera.position);
            // console.log(input_model.position);

            // 應用預設縮放
            input_model.scale.set(
                settings.scale.x,
                settings.scale.y,
                settings.scale.z
            );

            // 應用預設旋轉
            // input_model.rotation.set(
            //     settings.rotation.x,
            //     settings.rotation.y,
            //     settings.rotation.z
            // );

            // 應用預設相機位置
            // camera.position.set(
            //     settings.camera.x,
            //     settings.camera.y,
            //     settings.camera.z
            // );

            // const box = new THREE.Box3().setFromObject(input_model);
            // const offset = 1.00;

            scene.add(gltf.scene);

           

            // 計算模型的幾何中心
            const box = new THREE.Box3().setFromObject(input_model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            // 調整模型位置，使幾何中心位於 (0, 0, 0)
            input_model.position.set(
                -center.x,
                -center.y,
                -center.z
            );

            // 保存初始調整後的位置（居中位置）
            initialAdjustedPosition = input_model.position.clone();
            // initialAdjustedPosition.y -= 1.5;
            initialPosition = input_model.position.clone();

            // 重新計算模型的中心（因為位置已改變）
            const adjustedBox = new THREE.Box3().setFromObject(input_model);
            const adjustedCenter = adjustedBox.getCenter(new THREE.Vector3());

            // 計算相機的 Z 軸位置，確保模型居中
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

            // 設置相機位置
            camera.position.set(adjustedCenter.x, adjustedCenter.y+5, adjustedCenter.z + cameraZ);

            // 設置 OrbitControls 的目標為模型中心
            controls.target.copy(adjustedCenter);
            controls.update();

            

            console.log(camera.position);

            originalMaterials = new Map();
            input_model.traverse((child) => {
                if (child.isMesh) {
                    originalMaterials.set(child, child.material);
                }
            });

            // 通用的頂點著色器
            const vertexShader = `
                varying vec3 vNormal;
                flat varying vec3 vFlatNormal;
                varying vec3 vPosition;
                varying vec3 vColor;

                uniform vec3 lightPosition;
                uniform vec3 lightColor;
                uniform vec3 ambientColor;
                uniform vec3 diffuseColor;
                uniform vec3 specularColor;
                uniform float shininess;
                uniform int shadingMode;

                void main() {
                    vec3 normal = normalize(normalMatrix * normal);
                    vNormal = normal;
                    vFlatNormal = normal;
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

                    if (shadingMode == 4) {
                        vec3 lightDir = normalize(lightPosition - vPosition);
                        vec3 viewDir = normalize(-vPosition);
                        vec3 reflectDir = reflect(-lightDir, normal);

                        vec3 ambient = ambientColor;
                        float diff = max(dot(normal, lightDir), 0.0);
                        vec3 diffuse = diff * diffuseColor * lightColor;
                        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                        vec3 specular = spec * specularColor * lightColor;

                        vColor = ambient + diffuse + specular;
                    } else {
                        vColor = vec3(0.0);
                    }

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;

            // Phong 片段著色器
            const phongFragmentShader = `
                varying vec3 vNormal;
                varying vec3 vPosition;

                uniform vec3 lightPosition;
                uniform vec3 lightColor;
                uniform vec3 ambientColor;
                uniform vec3 diffuseColor;
                uniform vec3 specularColor;
                uniform float shininess;

                void main() {
                    vec3 lightDir = normalize(lightPosition - vPosition);
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(-vPosition);
                    vec3 reflectDir = reflect(-lightDir, normal);

                    vec3 ambient = ambientColor;
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 diffuse = diff * diffuseColor * lightColor;
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                    vec3 specular = spec * specularColor * lightColor;

                    vec3 finalColor = ambient + diffuse + specular;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;

            // 創建 Phong ShaderMaterial
            phongShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: phongFragmentShader,
                uniforms: {
                    lightPosition: { value: spotLight1.position },
                    lightColor: { value: spotLight1.color },
                    ambientColor: { value: new THREE.Color(0x333333) },
                    diffuseColor: { value: new THREE.Color(0xaaaaaa) },
                    specularColor: { value: new THREE.Color(0xffffff) },
                    shininess: { value: 32.0 },
                    textureMap: { value: null },
                    shadingMode: { value: 1 }
                }
            });

            // 卡通渲染（Toon Shading）片段著色器
            const toonFragmentShader = `
                varying vec3 vNormal;
                varying vec3 vPosition;

                uniform vec3 lightPosition;
                uniform vec3 lightColor;
                uniform vec3 ambientColor;
                uniform vec3 diffuseColor;
                uniform vec3 specularColor;
                uniform float shininess;

                void main() {
                    vec3 lightDir = normalize(lightPosition - vPosition);
                    vec3 normal = normalize(vNormal);
                    vec3 viewDir = normalize(-vPosition);
                    vec3 reflectDir = reflect(-lightDir, normal);

                    vec3 ambient = ambientColor;
                    float diff = max(dot(normal, lightDir), 0.0);
                    diff = floor(diff * 3.0) / 3.0;
                    vec3 diffuse = diff * diffuseColor * lightColor;
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                    spec = step(0.5, spec);
                    vec3 specular = spec * specularColor * lightColor;

                    vec3 finalColor = ambient + diffuse + specular;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;

            // 創建 Toon ShaderMaterial
            toonShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: toonFragmentShader,
                uniforms: {
                    lightPosition: { value: spotLight1.position },
                    lightColor: { value: spotLight1.color },
                    ambientColor: { value: new THREE.Color(0x333333) },
                    diffuseColor: { value: new THREE.Color(0xaaaaaa) },
                    specularColor: { value: new THREE.Color(0xffffff) },
                    shininess: { value: 32.0 },
                    textureMap: { value: null },
                    shadingMode: { value: 2 }
                }
            });

            // Flat Shading 片段著色器
            const flatFragmentShader = `
                flat varying vec3 vFlatNormal;
                varying vec3 vPosition;

                uniform vec3 lightPosition;
                uniform vec3 lightColor;
                uniform vec3 ambientColor;
                uniform vec3 diffuseColor;
                uniform vec3 specularColor;
                uniform float shininess;

                void main() {
                    vec3 lightDir = normalize(lightPosition - vPosition);
                    vec3 normal = normalize(vFlatNormal);
                    vec3 viewDir = normalize(-vPosition);
                    vec3 reflectDir = reflect(-lightDir, normal);

                    vec3 ambient = ambientColor;
                    float diff = max(dot(normal, lightDir), 0.0);
                    vec3 diffuse = diff * diffuseColor * lightColor;
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                    vec3 specular = spec * specularColor * lightColor;

                    vec3 finalColor = ambient + diffuse + specular;
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `;

            // 創建 Flat ShaderMaterial
            flatShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: flatFragmentShader,
                uniforms: {
                    lightPosition: { value: spotLight1.position },
                    lightColor: { value: spotLight1.color },
                    ambientColor: { value: new THREE.Color(0x333333) },
                    diffuseColor: { value: new THREE.Color(0xaaaaaa) },
                    specularColor: { value: new THREE.Color(0xffffff) },
                    shininess: { value: 32.0 },
                    textureMap: { value: null },
                    shadingMode: { value: 3 }
                },
                flatShading: true
            });

            // Gouraud Shading 片段著色器
            const gouraudFragmentShader = `
                varying vec3 vColor;

                void main() {
                    gl_FragColor = vec4(vColor, 1.0);
                }
            `;

            // 創建 Gouraud ShaderMaterial
            gouraudShaderMaterial = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: gouraudFragmentShader,
                uniforms: {
                    lightPosition: { value: spotLight1.position },
                    lightColor: { value: spotLight1.color },
                    ambientColor: { value: new THREE.Color(0x333333) },
                    diffuseColor: { value: new THREE.Color(0xaaaaaa) },
                    specularColor: { value: new THREE.Color(0xffffff) },
                    shininess: { value: 32.0 },
                    textureMap: { value: null },
                    shadingMode: { value: 4 }
                }
            });

            // 創建包圍盒和輔助器
            boxHelper = new THREE.Box3Helper(box, 0xffff00);
            axesHelper = new THREE.AxesHelper(200);
            axesHelper.position.y = box.min.y;
            axesHelper.visible = false;
            scene.add(axesHelper);

            gridHelper = new THREE.GridHelper(100, 50);
            gridHelper.position.y = box.min.y;
            gridHelper.visible = false;
            scene.add(gridHelper);

            // 更新包圍盒和輔助器
            boxHelper.box = box;
            axesHelper.position.y = box.min.y;
            gridHelper.position.y = box.min.y;
            updateHelpers();

            // 更新 Position Control 的值
            positionControlValues.posX = input_model.position.x;
            positionControlValues.posY = input_model.position.y-1.5;
            positionControlValues.posZ = input_model.position.z;
            posXControl.setValue(input_model.position.x);
            posYControl.setValue(input_model.position.y-1.5);
            posZControl.setValue(input_model.position.z);
            posXControl.updateDisplay();
            posYControl.updateDisplay();
            posZControl.updateDisplay();

            // 更新 Scale Control 的值
            scaleControl.scaleX = input_model.scale.x;
            scaleControl.scaleY = input_model.scale.y;
            scaleControl.scaleZ = input_model.scale.z;
            scaleControl.uniformScale = input_model.scale.x; // 假設 x, y, z 相等
            scaleXControl.setValue(input_model.scale.x);
            scaleYControl.setValue(input_model.scale.y);
            scaleZControl.setValue(input_model.scale.z);
            uniformScaleControl.setValue(input_model.scale.x);
            scaleXControl.updateDisplay();
            scaleYControl.updateDisplay();
            scaleZControl.updateDisplay();
            uniformScaleControl.updateDisplay();

            // 更新 Camera Control 的值
            camerapositionControl.x = camera.position.x;
            camerapositionControl.y = camera.position.y;
            camerapositionControl.z = camera.position.z;
            camerapositionXControl.setValue(camera.position.x);
            camerapositionYControl.setValue(camera.position.y);
            camerapositionZControl.setValue(camera.position.z);
            camerapositionXControl.updateDisplay();
            camerapositionYControl.updateDisplay();
            camerapositionZControl.updateDisplay();

            // // 更新 OrbitControls 的目標
            // controls.target.set(
            //     input_model.position.x,
            //     input_model.position.y,
            //     input_model.position.z
            // );
            // controls.update();

            // 開始動畫
            isAnimating = true;
            startTime = Date.now();
            animate();

            console.log(camera.position);
            console.log(input_model.position);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error(error);
        }
    );
}

// 更新幫助器位置的函數
function updateHelpers() {
    if (input_model) {
        const box = new THREE.Box3().setFromObject(input_model);
        const center = box.getCenter(new THREE.Vector3());

        boxHelper.box = box;
        axesHelper.position.y = box.min.y;
        gridHelper.position.y = box.min.y;

        gridHelper.position.set(center.x, box.min.y, center.z);
        axesHelper.position.set(center.x, box.min.y, center.z);
    }
}

// 更新包圍盒助手的函數
const updateBoxHelper = () => {
    if (input_model) {
        const box = new THREE.Box3().setFromObject(input_model);
        boxHelper.box = box;
    }
};

// 初始加載第一個預設模型
loadDefaultModel('model1');

// 為按鈕添加事件監聽器
document.getElementById('defaultModel1').addEventListener('click', () => {
    if (currentDefaultModel !== 'model1') {
        loadDefaultModel('model1');
    }
    gui.close();
});

document.getElementById('defaultModel2').addEventListener('click', () => {
    if (currentDefaultModel !== 'model2') {
        loadDefaultModel('model2');
    }
    gui.close();
});

document.getElementById('defaultModel3').addEventListener('click', () => {
    if (currentDefaultModel !== 'model3') {
        loadDefaultModel('model3');
    }
    gui.close();
});

let step = 0;
let needsRender = true;

// 修改 animate 函數，移除 position.y 的動畫
function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // 僅保留旋轉動畫
        input_model.rotation.y = Math.sin(progress * Math.PI * 2) * Math.abs(Math.cos(progress * Math.PI * 2 / 3) / 4);

        if (progress === 1) {
            isAnimating = false;
            input_model.rotation.y = 0;
        }
    }

    if (controls.autoRotate) {
        controls.update();
    }

    controls.update();
    renderer.render(scene, camera);
    stats.update();
    needsRender = false;
}

window.addEventListener("resize", function () {
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(this.window.innerWidth, this.window.innerHeight);
});
