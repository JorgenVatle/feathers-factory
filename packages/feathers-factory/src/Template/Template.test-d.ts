import { faker } from '@faker-js/faker';
import { describe, expectTypeOf, it } from 'vitest';
import { FactoryTemplate } from './Template';

describe('FactoryTemplate', () => {
    
    it('exposes return types of sibling functions through a context parameter', () => {
        new FactoryTemplate({
            arrowFunction: () => 'ok' as const,
            // Todo: use non-explicit type
            asyncPromise: async (): Promise<'ok'> => 'ok' as const,
            asyncDate: () => new Date(),
            
            async testThis() {
                expectTypeOf(await this.get('arrowFunction')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncPromise')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncDate')).toEqualTypeOf<Date>();
                return 'ok';
            }
        })
    })
    
    it('exposes return types of sibling functions through method "this" context', () => {
        new FactoryTemplate({
            arrowFunction: () => 'ok' as const,
            asyncPromise: async () => 'ok' as const,
            asyncDate: () => { return new Date() },
            
            async testThis() {
                expectTypeOf(await this.get('arrowFunction')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncPromise')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncDate')).toEqualTypeOf<Date>();
                return 'ok';
            },
            
            async testParam(ctx) {
                expectTypeOf(await ctx.get('arrowFunction')).toEqualTypeOf<'ok'>();
                expectTypeOf(await ctx.get('asyncPromise')).toEqualTypeOf<'ok'>();
                expectTypeOf(await ctx.get('asyncDate')).toEqualTypeOf<Date>();
                return 'ok';
            }
        })
    })
    
    it('will infer types when referencing sibling functions from "this" context', async () => {
        const template = new FactoryTemplate({
            firstName: () => 'John' as const,
            lastName: () => 'Doe' as const,
            fullName() {
                return `${this.get('firstName')} ${this.get('lastName')}` as 'John Doe';
            },
            age: (): 50 => 50,
            async description() {
                return `${await this.get('fullName')} (${await this.get('age')})` as 'John Doe (50)';
            },
            async test() {
                expectTypeOf(await this.get('fullName')).toEqualTypeOf<'John Doe'>();
                expectTypeOf(await this.get('age')).toEqualTypeOf<50>();
                expectTypeOf(await this.get('description')).toEqualTypeOf<'John Doe (50)'>();
                return 'ok';
            }
        });
        
        expectTypeOf(await template.resolveField('fullName')).toEqualTypeOf<'John Doe'>();
        expectTypeOf(await template.resolveField('age')).toEqualTypeOf<50>();
        expectTypeOf(await template.resolveField('description')).toEqualTypeOf<'John Doe (50)'>();
    })
    
    it('handles static fields', async () => {
        const template = new FactoryTemplate({
            staticField: 'ok' as const,
            staticPromise: Promise.resolve('ok' as const),
            async testThis() {
                expectTypeOf(await this.get('staticField')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('staticPromise')).toEqualTypeOf<'ok'>();
            },
            async testParam(ctx) {
                expectTypeOf(await ctx.get('staticField')).toEqualTypeOf<'ok'>();
                expectTypeOf(await ctx.get('staticPromise')).toEqualTypeOf<'ok'>();
            }
        });
        
        expectTypeOf(await template.resolveField('staticField')).toEqualTypeOf<'ok'>();
        expectTypeOf(await template.resolveField('staticPromise')).toEqualTypeOf<'ok'>();
    })
    
    it('handles method fields', async () => {
        const template = new FactoryTemplate({
            staticField() {
                return 'ok' as const
            },
            async staticPromise() {
                return 'ok' as const
            },
            async testThis() {
                expectTypeOf(await this.get('staticField')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('staticPromise')).toEqualTypeOf<'ok'>();
            },
            // Todo: resolve type error
            // testParam: async (ctx) => {
            //     expectTypeOf(await ctx?.get('staticField')).toEqualTypeOf<'ok'>();
            //     expectTypeOf(await ctx.get('staticPromise')).toEqualTypeOf<'ok'>();
            // }
        });
        
        expectTypeOf(await template.resolveField('staticField')).toEqualTypeOf<'ok'>();
        expectTypeOf(await template.resolveField('staticPromise')).toEqualTypeOf<'ok'>();
    })
    
    describe('.get() method dot notation', () => {
        it('works 1 level deep for simple schema fields', async () => {
            const template = new FactoryTemplate({
                firstName: () => 'John' as const,
                lastName: () => 'Doe' as const,
                address: () => {
                    return {
                        street: faker.location.streetAddress(),
                        city: faker.location.city(),
                        zip: parseInt(faker.location.zipCode()),
                    }
                },
                
                async testThis() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<'John'>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<'Doe'>();
                    expectTypeOf(await this.get('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.zip')).toEqualTypeOf<number>();
                },
                
                async testParam(ctx) {
                    expectTypeOf(await ctx.get('firstName')).toEqualTypeOf<'John'>();
                    expectTypeOf(await ctx.get('lastName')).toEqualTypeOf<'Doe'>();
                    expectTypeOf(await ctx.get('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.get('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.get('address.zip')).toEqualTypeOf<number>();
                }
            })
            
            expectTypeOf(await template.resolveField('firstName')).toEqualTypeOf<'John'>();
            expectTypeOf(await template.resolveField('lastName')).toEqualTypeOf<'Doe'>();
            expectTypeOf(await template.resolveField('address.street')).toEqualTypeOf<string>();
            expectTypeOf(await template.resolveField('address.city')).toEqualTypeOf<string>();
            expectTypeOf(await template.resolveField('address.zip')).toEqualTypeOf<number>();
        });
        
        it('works 1 level deep for promised schema fields', async () => {
            const template = new FactoryTemplate({
                firstName: () => 'John' as const,
                lastName: () => 'Doe' as const,
                address: () => Promise.resolve({
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    zip: parseInt(faker.location.zipCode()),
                }),
                
                async testThis() {
                    expectTypeOf(await this.get('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.zip')).toEqualTypeOf<number>();
                },
                
                async testParam(ctx) {
                    expectTypeOf(await ctx.get('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.get('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.get('address.zip')).toEqualTypeOf<number>();
                }
            })
            
            expectTypeOf(await template.resolveField('address.street')).toEqualTypeOf<string>();
            expectTypeOf(await template.resolveField('address.city')).toEqualTypeOf<string>();
            expectTypeOf(await template.resolveField('address.zip')).toEqualTypeOf<number>();
        })
    })
    
    describe('.call() method dot notation', () => {
        it('works 1 level deep for simple schema fields', async () => {
            const template = new FactoryTemplate({
                firstName: () => 'John' as const,
                lastName: () => 'Doe' as const,
                address: () => {
                    return {
                        street: faker.location.streetAddress(),
                        city: faker.location.city(),
                        zip: parseInt(faker.location.zipCode()),
                    }
                },
                
                async testThis() {
                    expectTypeOf(await this.call('firstName')).toEqualTypeOf<'John'>();
                    expectTypeOf(await this.call('lastName')).toEqualTypeOf<'Doe'>();
                    expectTypeOf(await this.call('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await this.call('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await this.call('address.zip')).toEqualTypeOf<number>();
                },
                
                async testParam(ctx) {
                    expectTypeOf(await ctx.call('firstName')).toEqualTypeOf<'John'>();
                    expectTypeOf(await ctx.call('lastName')).toEqualTypeOf<'Doe'>();
                    expectTypeOf(await ctx.call('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.call('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.call('address.zip')).toEqualTypeOf<number>();
                }
            })
        });
        
        it('works 1 level deep for promised schema fields', async () => {
            const template = new FactoryTemplate({
                firstName: () => 'John' as const,
                lastName: () => 'Doe' as const,
                address: () => Promise.resolve({
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    zip: parseInt(faker.location.zipCode()),
                }),
                
                async testThis() {
                    expectTypeOf(await this.call('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await this.call('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await this.call('address.zip')).toEqualTypeOf<number>();
                },
                
                async testParam(ctx) {
                    expectTypeOf(await ctx.call('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.call('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await ctx.call('address.zip')).toEqualTypeOf<number>();
                }
            })
        })
    })
    
    describe('Context call methods', () => {
        
        it('Resolves types for static fields', async () => {
            new FactoryTemplate({
                staticField: 'ok' as const,
                staticPromise: Promise.resolve('ok' as const),
                
                async testThis() {
                    expectTypeOf(await this.call('staticField')).toEqualTypeOf<'ok'>();
                    expectTypeOf(await this.call('staticPromise')).toEqualTypeOf<'ok'>();
                }
            })
        })
        
        it('Resolves types for method fields', async () => {
            new FactoryTemplate({
                method() {
                    return 'ok' as const
                },
                async methodPromise() {
                    return 'ok' as const
                },
                
                async testThis() {
                    expectTypeOf(await this.call('method')).toEqualTypeOf<'ok'>();
                    expectTypeOf(await this.call('methodPromise')).toEqualTypeOf<'ok'>();
                }
            })
        });
        
        it('Resolves types for arrow functions', async () => {
            new FactoryTemplate({
                arrowFunction: () => 'ok' as const,
                arrowPromise: () => Promise.resolve('ok' as const),
                
                async testThis() {
                    expectTypeOf(await this.call('arrowFunction')).toEqualTypeOf<'ok'>();
                    expectTypeOf(await this.call('arrowPromise')).toEqualTypeOf<'ok'>();
                }
            })
        })
    })
    
})