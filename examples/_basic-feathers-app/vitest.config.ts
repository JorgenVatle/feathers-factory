import * as Path from 'node:path';
import { defineProject } from 'vitest/config';

const __dirname = new URL('.', import.meta.url).pathname;

export default defineProject({
    test: {
        name: 'Basic Feathers App',
        alias: {
            'feathers-factory': Path.join(__dirname, '../../src/index.ts'),
        },
    }
})