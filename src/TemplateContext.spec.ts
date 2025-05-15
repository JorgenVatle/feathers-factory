import { describe, expect, it, vi } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';
import { TemplateContext } from './TemplateContext';

describe('TemplateContext', () => {
    
    describe('Basic field resolving', () => {
        const context = new TemplateContext(
            new FactoryTemplate({
                staticField: 'ok',
                arrowFunction: () => 'ok',
            })
        )
        
        it('can resolve static fields', async () => {
            expect(await context.get('staticField')).toEqual('ok');
        })
        
        it('can resolve arrow functions', async () => {
            expect(await context.get('arrowFunction')).toEqual('ok');
        });
        
        it('did not add unexpected fields to the resulting state', () => {
            expect(context._state).toEqual({
                staticField: 'ok',
                arrowFunction: 'ok',
            })
        })
    })
    
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
        it(`will not call template functions more than once for a given field`, async () => {
            const firstName = vi.fn(() => 'John');
            const lastName = vi.fn(() => 'Doe');
            const fullName = vi.fn(() => `${firstName()} ${lastName()}`);
            
            const context = new TemplateContext(
                new FactoryTemplate({
                    firstName,
                    lastName,
                    fullName,
                })
            );
            
            await context.get('firstName');
            await context.get('lastName');
            await context.get('fullName');
            
            expect(firstName).toHaveBeenCalledTimes(1);
            expect(lastName).toHaveBeenCalledTimes(1);
            expect(fullName).toHaveBeenCalledTimes(1);
        })
    })
    
    
})