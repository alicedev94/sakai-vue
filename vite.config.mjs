import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
//import basicSsl from '@vitejs/plugin-basic-ssl';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true,
        include: ['html5-qrcode']
    },
    plugins: [
        //basicSsl(),
        vue(),
        {
            name: 'onesignal-root-worker-dev',
            configureServer(server) {
                const workerMap = {
                    '/OneSignalSDKWorker.js': path.resolve(process.cwd(), 'public', 'OneSignalSDKWorker.js'),
                    '/OneSignalSDKUpdaterWorker.js': path.resolve(process.cwd(), 'public', 'OneSignalSDKUpdaterWorker.js')
                };

                server.middlewares.use((req, res, next) => {
                    const reqPath = req.url?.split('?')[0];
                    const filePath = reqPath ? workerMap[reqPath] : null;
                    if (!filePath) {
                        next();
                        return;
                    }
                    if (!fs.existsSync(filePath)) {
                        res.statusCode = 404;
                        res.end('Not found');
                        return;
                    }
                    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                    res.end(fs.readFileSync(filePath, 'utf8'));
                });
            }
        },
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    base: '/v1/',
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        host: true,
        port: 3000,
        https: false,
        proxy: {
            // Proxy para las peticiones al backend
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                // rewrite: (path) => path.replace(/^\/api/, '/api'), // Mantener /api en el path
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('Proxy error:', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response:', proxyRes.statusCode, req.url);
                    });
                }
            }
        }
    }
});
