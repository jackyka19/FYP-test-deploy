// // const express = require("express");
// // const app = express();
// // const path = require('path');

// // app.use(express.static(__dirname + '/public')); 
// // app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
// // app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// // app.listen(4000, ()=>{
// //     console.log("visit http://127.0.0.1:4000");
// // })


// const express = require("express");
// const app = express();
// const path = require('path');
// const helmet = require('helmet');
// const csrf = require('csurf');
// const cookieParser = require('cookie-parser');

// // Middleware to parse cookies
// app.use(cookieParser());

// // Setup helmet for security headers
// app.use(helmet());

// // Setup CSRF protection
// const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection);

// // Serve static files
// app.use(express.static(__dirname + '/public')); 
// app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
// app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

// // Set Content Security Policy (CSP)
// app.use((req, res, next) => {
//     res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none';");
//     next();
// });

// // Limit request size
// app.use(express.json({ limit: '1mb' }));
// app.use(express.urlencoded({ limit: '1mb', extended: true }));

// // Start the server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://127.0.0.1:${PORT}`);
// });
const express = require("express");
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/public')); 
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

app.listen(4000, ()=>{
    console.log("visit http://127.0.0.1:4000");
})