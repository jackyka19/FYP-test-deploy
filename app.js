// // 原本run得ok
// const express = require("express");
// const app = express();
// const path = require('path');


// app.use(express.static(__dirname + '/public')); 
// app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
// app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));


// // Limit request size (for security)
// // app.use(express.json({ limit: '25mb' }));
// // app.use(express.urlencoded({ limit: '25mb', extended: true }));

// app.listen(4000, ()=>{
//     console.log("visit http://127.0.0.1:4000");
// })


const express = require("express");
const app = express();
const path = require('path');
const crypto = require('crypto');
// const fs = require('fs');
const helmet = require('helmet');

const rateLimit = require('express-rate-limit'); // 限制每個 IP 的請求速率

// 限制每個 IP 的請求速率
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 100, // 每個 IP 最多 100 次請求
    message: "Too many requests from this IP, please try again later."
});

//添加日誌（監控和調試）
// const morgan = require('morgan');

const fileUpload = require('express-fileupload'); //處理文件上傳並設置大小限制


//------------------------------------------------------------------------

// 設置 EJS 為模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// 中間件：為每個請求生成動態 nonce
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

// 文件上傳中間件，限制文件大小
app.use(fileUpload({
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    abortOnLimit: true, // 超過限制時終止上傳
    responseOnLimit: 'File size limit has been reached (max 100MB)'
}));


// 限制請求大小
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));


// 使用 helmet 設置安全標頭
app.use(
    helmet({
        contentSecurityPolicy: false, // 關閉 helmet 的 CSP，因為 index.ejs 已定義
        xPoweredBy: false, // 禁用 X-Powered-By 標頭
        xXssProtection: true, // 啟用 XSS 保護
        xContentTypeOptions: true, // 防止 MIME 類型嗅探 修正為 true 原本設置 Referrer-Policy
        referrerPolicy: { policy: "no-referrer" }, // 設置 Referrer-Policy
        frameguard: { action: "deny" }, // 防止點擊劫持
    })
);

// 靜態檔案服務
app.use(express.static(__dirname + '/public')); 
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));



// 限制每個 IP 的請求速率
app.use(limiter);

// 記錄 HTTP 請求
// app.use(morgan('combined')); 

// 動態渲染 index.ejs
app.get('/', (req, res) => {
    res.render('index', { nonce: res.locals.nonce });
});

// 文件上傳路由
app.post('/upload', (req, res) => {
    if (!req.files || !req.files['model-file-input-modal']) {
        return res.status(400).send('No file uploaded.');
    }

    const file = req.files['model-file-input-modal'];
    const allowedFileTypes = ['.glb', '.bin', '.obj', '.fbx', '.stl'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedFileTypes.includes(fileExtension)) {
        return res.status(400).send(`Unsupported file format: ${fileExtension}. Please upload .glb, .bin, .obj, .fbx, or .stl files.`);
    }

    // 保存文件（根據需求調整路徑）
    const uploadPath = path.join(__dirname, 'public/uploads', file.name);
    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send('Error uploading file.');
        }
        res.send('File uploaded successfully!');
    });
});

app.listen(4000, () => {
    console.log("visit http://127.0.0.1:4000");
});