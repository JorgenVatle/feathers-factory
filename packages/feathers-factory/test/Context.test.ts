import { FactoryTemplate } from 'feathers-factory';
import { describe, expect, it } from 'vitest';

describe('Context error handling', () => {
    
    describe('non-async properties', () => {
        const template = new FactoryTemplate({
            test() {
                throw new ErrorTest('hello world');
            }
        });
        
        it('keeps the original error message', async () => {
            const resolvedTemplate = template.resolve();
            await expect(resolvedTemplate).rejects.toHaveProperty('message', expect.stringContaining('hello world'));
        })
    })
})


class ErrorTest extends Error {}
