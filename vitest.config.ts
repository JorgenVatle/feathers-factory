import Path from 'node:path';
import { defineConfig } from 'vitest/config';

const __dirname = new URL('.', import.meta.url).pathname;

function include(dir: string) {
    return Path.join(__dirname, dir, '/**/*.{test,spec}.?(c|m)[jt]s?(x)');
}

export default defineConfig({
    test: {
        typecheck: {
            enabled: true,
        },
        include: [
            include('packages/feathers-factory'),
        ],
        alias: {
            'feathers-factory': Path.join(__dirname, 'packages/feathers-factory/src/index.ts'),
        },
        workspace: [
            './vitest.config.ts',
            {
                extends: true,
                test: {
                    name: 'Basic Feathers App',
                    include: [
                        include('examples/_basic-feathers-app'),
                    ]
                }
            }
        ],
    }
})