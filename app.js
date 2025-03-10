// 原本run得ok
const express = require("express");
const app = express();
const path = require('path');


app.use(express.static(__dirname + '/public')); 
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));


// Limit request size (for security)
// app.use(express.json({ limit: '25mb' }));
// app.use(express.urlencoded({ limit: '25mb', extended: true }));

app.listen(4000, ()=>{
    console.log("visit http://127.0.0.1:4000");
})



// // 原本run得ok
// const express = require("express");
// const app = express();
// const path = require('path');

// const helmet = require('helmet'); // helmet (for security)

// app.use(express.static(__dirname + '/public')); 
// app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
// app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// // // Setup helmet for security headers
// // app.use(helmet());


// // app.use((req, res, next) => {
// //     res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none';");
// //     next();
// // });


// // Limit request size (for security)
// app.use(express.json({ limit: '25mb' }));
// app.use(express.urlencoded({ limit: '25mb', extended: true }));

// app.listen(4000, ()=>{
//     console.log("visit http://127.0.0.1:4000");
// })



// deepseek調較的 (run 唔到)
// const express = require("express");
// const app = express();
// const path = require('path');
// const helmet = require('helmet');
// const validator = require('validator');

// // 使用 helmet 設置安全標頭
// app.use(
//     helmet({
//         contentSecurityPolicy: {
//             directives: {
//                 defaultSrc: ["'self'"],
//                 scriptSrc: ["'self'"],
//                 styleSrc: ["'self'", "https://fonts.googleapis.com"],
//                 fontSrc: ["'self'", "https://fonts.gstatic.com"],
//                 imgSrc: ["'self'", "data:"],
//                 objectSrc: ["'none'"],
//                 baseUri: ["'self'"],
//                 formAction: ["'self'"],
//                 frameAncestors: ["'none'"],
//             },
//         },
//     })
// );

// // 禁用 X-Powered-By 標頭
// app.disable('x-powered-by');

// // 設置其他安全標頭
// app.use((req, res, next) => {
//     res.setHeader("X-XSS-Protection", "1; mode=block");
//     res.setHeader("X-Content-Type-Options", "nosniff");
//     res.setHeader("Referrer-Policy", "no-referrer");
//     next();
// });

// // 靜態文件服務
// app.use(express.static(__dirname + '/public')); 
// app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
// app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// // 限制請求大小
// app.use(express.json({ limit: '25mb' }));
// app.use(express.urlencoded({ limit: '25mb', extended: true }));

// // 啟動伺服器
// app.listen(4000, () => {
//     console.log("visit http://127.0.0.1:4000");
// });