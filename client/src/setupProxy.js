// Proxy configuration for development
// This file is used by webpack-dev-server to proxy API requests

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5002',
      changeOrigin: true,
    })
  );
  
  // Handle WebSocket connections properly
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:5002',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
    })
  );
};