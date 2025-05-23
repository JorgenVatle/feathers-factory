import { faker } from '@faker-js/faker';
import { describe, expectTypeOf, it } from 'vitest';
import type { TemplateSchema } from './Schema';
import { defineTemplateSchema, FactoryTemplateV2 } from './Template';

describe('defineTemplateSchema', () => {
    
    it('exposes return types of sibling functions through a context parameter', () => {
        const schema = defineTemplateSchema({
            arrowFunction: () => 'ok' as const,
            asyncPromise: async () => 'ok' as const,
            asyncDate: () => new Date(),
            
            test(ctx) {
                expectTypeOf(ctx.arrowFunction).toEqualTypeOf<'ok'>();
                expectTypeOf(ctx.asyncPromise).toEqualTypeOf<Promise<'ok'>>();
                expectTypeOf(ctx.asyncDate).toEqualTypeOf<Date>();
            }
        });
    });
    
    it('is able to handle fields referencing other fields', () => {
        const schema = defineTemplateSchema({
            firstName: () => 'John' as const,
            lastName: () => 'Doe' as const,
            fullName(ctx) {
                return `${ctx.firstName} ${ctx.lastName}` as 'John Doe';
            },
            
            test(ctx) {
                let lastName: 'Doe' = ctx.lastName;
                let firstName: 'John' = ctx.firstName;
                // @ts-expect-error Todo: Fix type inference for cross-referencing fields
                let fullName: 'John Doe' = ctx.fullName;
                
                expectTypeOf(firstName).toEqualTypeOf<'John'>();
                expectTypeOf(lastName).toEqualTypeOf<'Doe'>();
                expectTypeOf(fullName).toEqualTypeOf<'John Doe'>();
            }
        });
        
        expectTypeOf(schema.firstName).returns.toEqualTypeOf<'John'>();
        expectTypeOf(schema.lastName).returns.toEqualTypeOf<'Doe'>();
        expectTypeOf(schema.fullName).returns.toEqualTypeOf<'John Doe'>();
        
    })
    
});

describe('FactoryTemplateV2', () => {
    
    it('exposes return types of sibling functions through a context parameter', () => {
        const template = new FactoryTemplateV2({
            arrowFunction: () => 'ok' as const,
            asyncPromise: async () => 'ok' as const,
            asyncDate: () => new Date(),
            
            async test() {
                expectTypeOf(await this.get('arrowFunction')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncPromise')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncDate')).toEqualTypeOf<Date>();
                return 'ok';
            }
        })
    })
    
    it('exposes return types of sibling functions through method "this" context', () => {
        const template = new FactoryTemplateV2({
            arrowFunction: () => 'ok' as const,
            asyncPromise: async () => 'ok' as const,
            asyncDate: () => new Date(),
            
            async test() {
                expectTypeOf(await this.get('arrowFunction')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncPromise')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('asyncDate')).toEqualTypeOf<Date>();
                return 'ok';
            }
        })
    })
    
    it('will infer types when referencing sibling functions from "this" context', async () => {
        const template = new FactoryTemplateV2({
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
        
        expectTypeOf(await template.get('fullName')).toEqualTypeOf<'John Doe'>();
        expectTypeOf(await template.get('age')).toEqualTypeOf<50>();
        expectTypeOf(await template.get('description')).toEqualTypeOf<'John Doe (50)'>();
    })
    
    it('handles static fields', async () => {
        const template = new FactoryTemplateV2({
            staticField: 'ok' as const,
            staticPromise: Promise.resolve('ok' as const),
            async test() {
                expectTypeOf(await this.get('staticField')).toEqualTypeOf<'ok'>();
                expectTypeOf(await this.get('staticPromise')).toEqualTypeOf<'ok'>();
            }
        });
        
        expectTypeOf(await template.get('staticField')).toEqualTypeOf<'ok'>();
        expectTypeOf(await template.get('staticPromise')).toEqualTypeOf<'ok'>();
    })
    
    describe('dot notation', () => {
        it('works 1 level deep for simple schema fields', async () => {
            const template = new FactoryTemplateV2({
                firstName: () => 'John' as const,
                lastName: () => 'Doe' as const,
                address: () => {
                  return {
                      street: faker.location.streetAddress(),
                      city: faker.location.city(),
                      zip: parseInt(faker.location.zipCode()),
                  }
                },
                
                async test() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<'John'>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<'Doe'>();
                    expectTypeOf(await this.get('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.zip')).toEqualTypeOf<number>();
                }
            })
            
            expectTypeOf(await template.get('firstName')).toEqualTypeOf<'John'>();
            expectTypeOf(await template.get('lastName')).toEqualTypeOf<'Doe'>();
            expectTypeOf(await template.get('address.street')).toEqualTypeOf<string>();
            expectTypeOf(await template.get('address.city')).toEqualTypeOf<string>();
            expectTypeOf(await template.get('address.zip')).toEqualTypeOf<number>();
        });
        
        it('works 1 level deep for promised schema fields', async () => {
            const template = new FactoryTemplateV2({
                firstName: () => 'John' as const,
                lastName: () => 'Doe' as const,
                address: () => Promise.resolve({
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    zip: parseInt(faker.location.zipCode()),
                }),
                
                async test() {
                    expectTypeOf(await this.get('address.street')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.city')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('address.zip')).toEqualTypeOf<number>();
                }
            })
            
            expectTypeOf(await template.get('address.street')).toEqualTypeOf<string>();
            expectTypeOf(await template.get('address.city')).toEqualTypeOf<string>();
            expectTypeOf(await template.get('address.zip')).toEqualTypeOf<number>();
        })
    })
    
})

describe('TemplateSchema type alias', () => {
    
    describe('context types', () => {
        const schema = {} as TemplateSchema<{
            arrowFunction: 'ok'
            asyncPromise: Promise<'ok'>
            asyncDate: Promise<Date>,
            
            test: 'ok', // Used as base for context check
        }>;
        
        it('has expected context fields within the "test" property', () => {
            expectTypeOf(schema.test)
                .parameter(0)
                .toHaveProperty('arrowFunction')
                .toEqualTypeOf<'ok'>();
            
            expectTypeOf(schema.test)
                .parameter(0)
                .toHaveProperty('asyncPromise')
                .toEqualTypeOf<Promise<'ok'>>();
            
            expectTypeOf(schema.test)
                .parameter(0)
                .toHaveProperty('asyncDate')
                .toEqualTypeOf<Promise<Date>>();
        });
        
        it('has expected context fields within the asyncDate property', () => {
            expectTypeOf(schema.asyncDate)
                .parameter(0)
                .toHaveProperty('arrowFunction')
                .toEqualTypeOf<'ok'>();
            
            expectTypeOf(schema.asyncDate)
                .parameter(0)
                .toHaveProperty('asyncPromise')
                .toEqualTypeOf<Promise<'ok'>>();
            
            expectTypeOf(schema.asyncDate)
                .parameter(0)
                .not
                .toHaveProperty('asyncDate')
        })
    })
    
})