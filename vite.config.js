/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 3000
    },
    build: {
        outDir: 'dist'
    },
    resolve: {
        alias: {
            '~': r('./src'),
            '@': r('./tests')
        }
    }
});
function r(p) {
    return resolve(__dirname, p);
}
