import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: 'public',
    server: {
        host: true,
        fs: {
            strict: false
        }
    }
});
