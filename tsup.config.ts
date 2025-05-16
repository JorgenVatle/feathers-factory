import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    skipNodeModulesBundle: true,
    format: ['cjs', 'esm'],
    sourcemap: true,
    dts: true,
    clean: true,
})