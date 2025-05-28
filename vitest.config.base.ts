import Path from 'node:path';
import { mergeConfig, UserWorkspaceConfig } from 'vitest/config';

const __dirname = new URL('.', import.meta.url).pathname;

export function include(dir: string) {
    return Path.join(__dirname, dir, '/**/*.{test,spec}.?(c|m)[jt]s?(x)');
}

const baseConfig = {
    test: {
        typecheck: {
            enabled: true,
        },
        alias: {
            'feathers-factory': Path.join(__dirname, 'packages/feathers-factory/src/index.ts'),
        }
    }
} satisfies UserWorkspaceConfig

export function sharedConfig(config: UserWorkspaceConfig) {
    return mergeConfig(
        baseConfig,
        config,
    )
}