import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    root: "src/",

    build: {
        outDir: "../dist",
        rollupOptions: {
            input: {
                main: resolve(import.meta.dirname, "src/index.html"),
                register: resolve(import.meta.dirname, "src/register/index.html"),
                login: resolve(import.meta.dirname, "src/login/index.html"),
                profile: resolve(import.meta.dirname, "src/profile/index.html"),
                favorites: resolve(import.meta.dirname, "src/favorites/index.html"),
            },
        },
    },
});