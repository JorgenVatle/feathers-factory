import { faker } from '@faker-js/faker';
import { describe, expectTypeOf, it } from 'vitest';
import { FactoryTemplate } from '../src/FactoryTemplate';

describe('FactoryTemplate', () => {
    
    
    const template = new FactoryTemplate({
        _id: () => 1,
        createdAt: () => new Date(),
        firstName: 'test',
        lastName: 'test',
    });
    
    describe('Resolved data types', async () => {
        const resolvedTemplate = await template.resolve();
        
        it('will unwrap functions to their return values', async () => {
            expectTypeOf(resolvedTemplate._id).toEqualTypeOf<number>();
            expectTypeOf(resolvedTemplate.createdAt).toEqualTypeOf<Date>();
        });
        
        it('will not unwrap non-function values', async () => {
            expectTypeOf(resolvedTemplate.firstName).toEqualTypeOf<string>();
            expectTypeOf(resolvedTemplate.lastName).toEqualTypeOf<string>();
        })
        
    })
    
    describe('Overrides', () => {
        
        it('allows partial overrides', async () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                firstName: 'newFirstName',
            });
        })
        
        it('allows overriding functions with static values', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                createdAt: new Date(),
            });
            
            expectTypeOf(template.resolve).toBeCallableWith({
                _id: 5,
            });
        })
        
        it('has to adhere to the original schema', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                // @ts-expect-error
                _id: () => 'INVALID_ID',
                
                // @ts-expect-error
                firstName: 1,
            })
            
        })
        
        it('allows overriding static fields with functions', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                firstName: () => 'some other name',
            });
        });
        
        it.todo('does not allow unknown fields', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                // @ts-ignore TODO
                unknownField: 'test',
            });
        })
        
    })
    
    describe('Template context', () => {
        describe('Within "this" type', () => {
            it('can reference sibling fields in the same template', async () => {
                const template = new FactoryTemplate({
                    firstName: 'test',
                    lastName: 'test',
                    age: (): number => 50,
                    async fullName() {
                        expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                    },
                });
            })
            
            it('is accessible within resolver overrides', async () => {
                const template = new FactoryTemplate({
                    firstName: 'test',
                    lastName: 'test',
                    age: (): number => 50,
                    fullName: () => 'test',
                });
                
                await template.resolve({
                    async fullName() {
                        expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                        return 'test';
                    },
                })
            })
        })
        
        describe('Function parameter', () => {
            it('is available as a parameter for use in arrow functions', () => {
                const template = new FactoryTemplate({
                    firstName: 'test',
                    lastName: 'test',
                    age: (): number => 50,
                    fullName: async (ctx) => {
                        expectTypeOf(await ctx.get('firstName')).toEqualTypeOf<string>();
                        expectTypeOf(await ctx.get('lastName')).toEqualTypeOf<string>();
                        expectTypeOf(await ctx.get('age')).toEqualTypeOf<number>();
                    },
                });
            })
            
            it('is available as a parameter in resolver overrides', async () => {
                const template = new FactoryTemplate({
                    firstName: 'test',
                    lastName: 'test',
                    age: (): number => 50,
                    fullName: () => 'test',
                });
                
                await template.resolve({
                    fullName: async (ctx) => {
                        expectTypeOf(await ctx.get('firstName')).toEqualTypeOf<string>();
                        expectTypeOf(await ctx.get('lastName')).toEqualTypeOf<string>();
                        expectTypeOf(await ctx.get('age')).toEqualTypeOf<number>();
                        return 'test';
                    },
                })
            })
        })
    });
    
    
    describe('Template extensions', async () => {
        const newTemplate = template.extend({
            dateOfBirth: () => new Date(),
        });
        const resolved = await newTemplate.resolve();
        
        it('can extend existing templates with new fields', async () => {
            expectTypeOf(resolved.dateOfBirth).toEqualTypeOf<Date>();
        })
        
        it('keeps the original template intact', async () => {
            expectTypeOf(resolved._id).toEqualTypeOf<number>();
            expectTypeOf(resolved.createdAt).toEqualTypeOf<Date>();
            expectTypeOf(resolved.firstName).toEqualTypeOf<string>();
            expectTypeOf(resolved.lastName).toEqualTypeOf<string>();
        })
        
        it('can override original field types', async () => {
            const newTemplate = template.extend({
                _id: () => ({ objectId: 'foo' }),
            });
            
            expectTypeOf(newTemplate.resolve).toBeCallableWith({
                _id: { objectId: '123' },
            });
        });
        
        describe(`"this" context`, () => {
            it('can access original template fields through "this"', async () => {
                const newTemplate = template.extend({
                    async fullName() {
                        expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('createdAt')).toEqualTypeOf<Date>();
                        
                        return `${await this.get('firstName')} ${await this.get('lastName')}`
                    },
                });
            });
            
            it('can access new template fields through "this"', async () => {
                const newTemplate = template.extend({
                    streetAddress: () => faker.location.streetAddress(),
                    city: () => faker.location.city(),
                    zip: () => parseInt(faker.location.zipCode()), // don't do this :)
                    async fullAddress() {
                        expectTypeOf(await this.get('streetAddress')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('city')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('zip')).toEqualTypeOf<number>();
                        return '';
                    }
                })
            })
        })
        
        it('it overrides optional fields from the original template', () => {
            const original = new FactoryTemplate({
                async address() {
                    if (Math.random() > 0.5) {
                        return;
                    }
                    return {
                        street: faker.location.streetAddress(),
                        city: faker.location.city(),
                        zip: faker.location.zipCode(),
                    }
                },
            });
            
            const newTemplate = original.extend({
                address: () => ({
                    street: '',
                    city: '',
                    zip: '',
                }),
                async fullAddress() {
                    const address = await this.get('address');
                    expectTypeOf(address.street).toEqualTypeOf<string>();
                    expectTypeOf(address.city).toEqualTypeOf<string>();
                    expectTypeOf(address.zip).toEqualTypeOf<string>();
                    return '';
                }
            })
        })
       
    })
    
    describe('Template output', () => {
        it('will resolve any functions and promises in the final output type', () => {
            const template = new FactoryTemplate({
                firstName: 'test',
                lastName: 'test',
                async fullName() {
                    return `${await this.get('firstName')} ${await this.get('lastName')}`
                },
                staticAsync: Promise.resolve('foo' as const)
            });
            const resolved = await template.resolve();
            
            expectTypeOf(resolved.fullName).toEqualTypeOf<string>();
            expectTypeOf(resolved.staticAsync).toEqualTypeOf<'foo'>();
        })
    })
    
})