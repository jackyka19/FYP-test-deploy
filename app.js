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
const fs = require('fs');

// 設置 EJS 為模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// 中間件：為每個請求生成動態 nonce
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    next();
});

// 靜態檔案服務
app.use(express.static(__dirname + '/public')); 
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// 限制請求大小（稍後詳述）
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// 動態渲染 index.ejs
app.get('/', (req, res) => {
    res.render('index', { nonce: res.locals.nonce });
});

app.listen(4000, () => {
    console.log("visit http://127.0.0.1:4000");
});