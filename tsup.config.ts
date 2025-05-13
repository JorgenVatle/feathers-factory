import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    skipNodeModulesBundle: true,
    sourcemap: true,
    dts: true,
})