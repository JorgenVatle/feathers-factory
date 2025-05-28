import { faker } from '@faker-js/faker';
import { FactoryTemplate } from 'feathers-factory';
import { describe, expectTypeOf, it } from 'vitest';

describe('FactoryTemplate', () => {
    
    const template = new FactoryTemplate({
        _id: (): number => 1,
        createdAt: () => new Date(),
        firstName: 'test',
        lastName: 'test',
        firstNameConst: 'Test' as const,
        registeredAt() {
            return this.get('createdAt');
        }
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
                lastName: 'test',
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
    
    describe('Template constructor context', () => {
        it(`is available through fields' "this" context`, async () => {
            const template = new FactoryTemplate({
                firstName: 'test' as const,
                lastName: 'test' as const,
                age: (): number => 50,
                async summary() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<'test'>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<'test'>();
                    expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                },
            });
        })
        
        it(`method fields can reference other methods with explicit return types`, async () => {
            new FactoryTemplate({
                // Synchronous function
                firstName: (): string => 'test',
                // method without context
                lastName(): string { return 'test' },
                // Method with context
                async age(): Promise<number> { return (await this.get('firstName')).length },
                // Static value
                createdAt: new Date(),
                
                async summary() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                    expectTypeOf(await this.get('createdAt')).toEqualTypeOf<Date>();
                    return 'test';
                },
            });
        })
        
        it(`method fields can reference other methods with implicit return types`, async () => {
            const template = new FactoryTemplate({
                // Synchronous function
                firstName: () => 'John' as const,
                // method without context
                lastName() { return 'Doe' as const },
                // Method with context
                async age() { return (await this.get('firstName')).length },
                // Static value
                createdAt: new Date(),
                // Method with peer dependencies
                async fullName() {
                  return `${await this.get('firstName')} ${await this.get('lastName')}` as const;
                },
                
                async summary() {
                    const summary = {
                        firstName: await this.get('firstName'),
                        lastName: await this.get('lastName'),
                        age: await this.get('age'),
                        createdAt: await this.get('createdAt'),
                        fullName: await this.get('fullName'),
                    }
                    
                    expectTypeOf(summary.firstName).toEqualTypeOf<'John'>();
                    expectTypeOf(summary.lastName).toEqualTypeOf<'Doe'>();
                    expectTypeOf(summary.age).toEqualTypeOf<number>();
                    expectTypeOf(summary.createdAt).toEqualTypeOf<Date>();
                    expectTypeOf(summary.fullName).toEqualTypeOf<'John Doe'>();
                    
                    return { summary };
                },
            });
            
            const resolved = await template.resolve();
            expectTypeOf(resolved.firstName).toEqualTypeOf<'John'>();
            expectTypeOf(resolved.lastName).toEqualTypeOf<'Doe'>();
            expectTypeOf(resolved.age).toEqualTypeOf<number>();
            expectTypeOf(resolved.createdAt).toEqualTypeOf<Date>();
            
        })
    })
    
    describe('Template resolver context', () => {
        const template = new FactoryTemplate({
            firstName: 'test' as const,
            lastName: 'test' as const,
            age: (): number => 50,
            summary: (): string => 'sum of all the fields above',
            // Todo: use non-explicit return type
            async shortDescription(): Promise<`test test (${number})`> {
                return `${await this.get('firstName')} ${await this.get('lastName')} (${await this.get('age')})` as const
            },
            // Todo: use non-explicit return type
            async descriptionLines(): Promise<string[]> {
                return [
                    await this.get('shortDescription'),
                    'more text',
                    'even more text',
                ] as string[]
            },
            async fullDescription() {
              return (await this.get('descriptionLines')).join('\n');
            },
            optionalField: 'ok' as 'ok' | undefined,
        });
        
        
        it(`is accessible through fields' "this" context`, async () => {
            await template.resolve({
                async summary() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<'test'>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<'test'>();
                    expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                    expectTypeOf(await this.get('shortDescription')).toEqualTypeOf<`test test (${number})`>();
                    expectTypeOf(await this.get('descriptionLines')).toEqualTypeOf<string[]>();
                    expectTypeOf(await this.get('fullDescription')).toEqualTypeOf<string>();
                    return 'test' as any;
                },
            })
        })
        
        it('can access fields with implicit return types', async () => {
            await new FactoryTemplate({
                // Synchronous function
                firstName: () => 'John' as const,
                // method without context
                lastName() {
                    return 'Doe' as const;
                },
                // Method with context
                async age() {
                    return (await this.get('firstName')).length;
                },
                // Static value
                createdAt: new Date(),
                test: () => {},
            }).resolve({
                async test() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<'John'>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<'Doe'>();
                    expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                    expectTypeOf(await this.get('createdAt')).toEqualTypeOf<Date>();
                },
            });
        })
        
        it('can access fields with explicit return types', async () => {
            await new FactoryTemplate({
                // Synchronous function
                firstName: (): string => 'test',
                // method without context
                lastName(): string { return 'test' },
                // Method with context
                async age(): Promise<number> { return (await this.get('firstName')).length },
                // Static value
                createdAt: new Date(),
                test: () => {},
            }).resolve({
                async test() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                    expectTypeOf(await this.get('createdAt')).toEqualTypeOf<Date>();
                },
            });
        });
        
        it('will mark optional fields as present when defined in overrides', async () => {
            await template.resolve({
                optionalField: 'ok',
                async summary() {
                    expectTypeOf(await this.get('optionalField')).toEqualTypeOf<'ok'>();
                    return 'test';
                }
            });
        })
        
    })
    
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
        
        describe('Overwriting field types from parent template', () => {
            it('allows rewrites of arrow functions', () =>{
                const newTemplate = template.extend({
                    _id: () => ({ objectId: 'foo' }),
                });
                
                expectTypeOf(newTemplate.resolve).toBeCallableWith({
                    _id: { objectId: '123' },
                });
            });
            
            it('allows rewrites of static fields', () => {
                const newTemplate = template.extend({
                    firstName: null,
                });
                
                expectTypeOf(newTemplate.resolve).toBeCallableWith({
                    firstName: null,
                });
            });
            
            it('allows rewrites of method fields', () => {
                const newTemplate = template.extend({
                    registeredAt: 'just now',
                });
                
                expectTypeOf(newTemplate.resolve).toBeCallableWith({
                    registeredAt: 'just now',
                });
            })
        })
        
        describe(`"this" context`, () => {
            it('can access original template fields through "this"', async () => {
                template.extend({
                    async fullName() {
                        expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                        expectTypeOf(await this.get('createdAt')).toEqualTypeOf<Date>();
                        
                        return `${await this.get('firstName')} ${await this.get('lastName')}`
                    },
                });
            });
            
            it('can access new template fields through "this"', async () => {
                  template.extend({
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
            
            it('can access new template fields that accesses original template fields', () => {
                template.extend({
                    async explicitTypeCast() {
                        expectTypeOf(await this.get('_id')).toEqualTypeOf<number>();
                        return await this.get('_id') as any as `_id:${number}`;
                    },
                    async literal() {
                        const firstName = await this.get('firstNameConst');
                        const result = `name:${firstName}` as const;
                        
                        expectTypeOf(firstName).toEqualTypeOf<'Test'>();
                        expectTypeOf(result).toEqualTypeOf<'name:Test'>();
                        
                        return result;
                    },
                    async test() {
                        expectTypeOf(await this.get('explicitTypeCast')).toEqualTypeOf<`_id:${number}`>();
                        
                        expectTypeOf(await this.get('literal')).toEqualTypeOf<'name:Test'>();
                    }
                });
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
            original.extend({
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
            });
        })
        
    })
    
    describe('Template output', () => {
        it('will resolve any functions and promises in the final output type', async () => {
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
            expectTypeOf(resolved.firstName).toEqualTypeOf<string>()
            expectTypeOf(resolved.lastName).toEqualTypeOf<string>()
        })
    })
    
})