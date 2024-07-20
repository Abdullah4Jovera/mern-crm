// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/socket.io',
        createProxyMiddleware({
            target: 'http://localhost:8080',
            ws: true,
            changeOrigin: true
        })
    );
};
