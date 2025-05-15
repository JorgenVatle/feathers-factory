import { faker } from '@faker-js/faker';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';
import { sleep } from './lib/Utilities';
import { TemplateContext } from './TemplateContext';

describe('TemplateContext', () => {
    
    describe('Basic field resolving', () => {
        const context = new TemplateContext(
            new FactoryTemplate({
                staticField: 'ok',
                arrowFunction: () => 'ok',
                staticPromise: Promise.resolve('ok'),
                asyncPromise: async () => 'ok',
                asyncDate: () => new Date(),
            })
        )
        
        it('can resolve static fields', async () => {
            const staticField = await context.get('staticField');
            expect(staticField).toEqual('ok');
            expectTypeOf(staticField).toEqualTypeOf<string>();
        })
        
        it('can resolve arrow functions', async () => {
            const arrowFunction = await context.get('arrowFunction');
            
            expect(arrowFunction).toEqual('ok');
            expectTypeOf(arrowFunction).toEqualTypeOf<string>();
        });
        
        it('can resolve static promises', async () => {
            const staticPromise = await context.get('staticPromise');
            
            expect(staticPromise).toEqual('ok');
            expectTypeOf(staticPromise).toEqualTypeOf<string>();
        })
        
        it('can resolve async functions', async () => {
            const asyncPromise = await context.get('asyncPromise');
            
            expect(asyncPromise).toEqual('ok');
            expectTypeOf(asyncPromise).toEqualTypeOf<string>();
        })
        
        it('can resolve async object types', async () => {
            const asyncDate = await context.get('asyncDate');
            
            expect(asyncDate).toEqual(expect.any(Date));
            expectTypeOf(asyncDate).toEqualTypeOf<Date>();
        })
        
        it('did not add unexpected fields to the resulting state', () => {
            expect(context._state).toEqual({
                staticField: 'ok',
                arrowFunction: 'ok',
                staticPromise: 'ok',
                asyncPromise: 'ok',
                asyncDate: expect.any(Date),
            })
        })
    })
    
    describe.todo('Promise rejection')
    
    describe('Sibling fields', () => {
        it('can resolve sibling fields using "this"', async () => {
            const context = new TemplateContext(
                new FactoryTemplate({
                    firstName: 'John',
                    lastName: 'Doe',
                    async fullName() {
                        return `${await this.get('firstName')} ${await this.get('lastName')}`
                    }
                })
            );
            
            expect(await context.get('fullName')).toEqual('John Doe');
        })
        
        it('can resolve sibling fields using context parameter', async () => {
            const context = new TemplateContext(
                new FactoryTemplate({
                    firstName: 'John',
                    lastName: 'Doe',
                    fullName: async (ctx) => {
                        return `${await ctx.get('firstName')} ${await ctx.get('lastName')}`
                    }
                })
            );
            
            expect(await context.get('fullName')).toEqual('John Doe');
        })
        
    });
    
    describe('Peer dependencies', () => {
        const mocks = {
            firstName: vi.fn(() => faker.person.firstName()),
            lastName: vi.fn(() => faker.person.lastName()),
            createdAt: vi.fn(() => performance.now()),
        }
        
        const context = new TemplateContext(
            new FactoryTemplate({
                fullName: async (ctx) => {
                    return `${await ctx.get('firstName')} ${await ctx.get('lastName')}`
                },
                firstName: mocks.firstName,
                lastName: mocks.lastName,
                createdAt: mocks.createdAt,
            })
        );
        
        it(`will not call template functions more than once for a given field`, async () => {
            await context.get('firstName');
            await context.get('lastName');
            await context.get('fullName');
            
            expect(mocks.firstName).toHaveBeenCalledTimes(1);
            expect(mocks.lastName).toHaveBeenCalledTimes(1);
        });
        
        it('will always return the same value for a given field', async () => {
            const resolved = {
                fullName: await context.get('fullName'),
                firstName: await context.get('firstName'),
                lastName: await context.get('lastName'),
                createdAt: await context.get('createdAt'),
            }
            const localCreatedAt = performance.now();
            
            
            expect(resolved.fullName).toEqual(`${resolved.firstName} ${resolved.lastName}`);
            
            await sleep(500);
            
            // Ensure fetching createdAt again will not update the timestamp
            await expect(context.get('createdAt')).resolves.toEqual(resolved.createdAt);
            
            // Ensure the timestamp captured right after resolving createdAt
            // still is greater even when requesting the field again.
            expect(localCreatedAt).toBeGreaterThanOrEqual(await context.get('createdAt'));
            
            expect(mocks.createdAt).toHaveBeenCalledOnce();
        });
        
        it('can bypass context caching using "this.call()"', async () => {
            const initialName = await context.get('fullName');
            const newName = await context.call('firstName');
            
            expect(initialName).not.toEqual(newName);
        })
        
    })
    
    
})