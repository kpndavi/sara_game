import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: 'public',
    server: {
        host: true,
        fs: {
            strict: false
        }
    },
    base: '/sara_game/' // Matches repository name https://github.com/kpndavi/sara_game
});
