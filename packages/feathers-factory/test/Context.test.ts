import { FactoryTemplate } from 'feathers-factory';
import { describe, expect, it } from 'vitest';

describe('Context errors', () => {
    
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
        
        it('has a stack trace', async () => {
            const resolvedTemplate = template.resolve();
            await expect(resolvedTemplate).rejects.toHaveProperty('stack', expect.stringContaining('hello world'));
        })
    });
    
    describe('async properties', () => {
        const template = new FactoryTemplate({
            async helloWorld() {
                throw new ErrorTest('hello world');
            },
            
            async test() {
                await this.get('helloWorld');
            }
        });
        
        it('keeps the original error message', async () => {
            const resolvedTemplate = template.resolve();
            await expect(resolvedTemplate).rejects.toHaveProperty('message', expect.stringContaining('hello world'));
        })
        
        it('has a stack trace', async () => {
            const resolvedTemplate = template.resolve();
            await expect(resolvedTemplate).rejects.toHaveProperty('stack', expect.stringContaining('hello world'));
        })
    })
})


class ErrorTest extends Error {}
