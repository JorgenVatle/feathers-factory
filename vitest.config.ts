import { defineConfig } from 'vitest/config';
import { include, sharedConfig } from './vitest.config.base';

const { test } = sharedConfig({})

export default defineConfig({
    test: {
        typecheck: {
            enabled: true,
        },
        include: [
            include('packages/feathers-factory'),
        ],
        alias: test.alias,
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