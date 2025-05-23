import { describe, expectTypeOf, it } from 'vitest';
import { defineTemplateSchema, FactoryTemplateV2, type TemplateSchema } from './FactoryTemplate-v2';

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
            
            test(ctx) {
                expectTypeOf(ctx.get('arrowFunction')).toEqualTypeOf<'ok'>();
                expectTypeOf(ctx.get('asyncPromise')).toEqualTypeOf<Promise<'ok'>>();
                expectTypeOf(ctx.get('asyncDate')).toEqualTypeOf<Date>();
                return 'ok';
            }
        })
    })
    
    it('exposes return types of sibling functions through method "this" context', () => {
        const template = new FactoryTemplateV2({
            arrowFunction: () => 'ok' as const,
            asyncPromise: async () => 'ok' as const,
            asyncDate: () => new Date(),
            
            test() {
                expectTypeOf(this.get('arrowFunction')).toEqualTypeOf<'ok'>();
                expectTypeOf(this.get('asyncPromise')).toEqualTypeOf<Promise<'ok'>>();
                expectTypeOf(this.get('asyncDate')).toEqualTypeOf<Date>();
                return 'ok';
            }
        })
    })
    
    it('handles static fields', () => {
        const template = new FactoryTemplateV2({
            staticField: 'ok' as const,
            test(ctx) {
                expectTypeOf(template.get('staticField')).toEqualTypeOf<'ok'>();
            }
        });
        
        expectTypeOf(template.get('staticField')).toEqualTypeOf<'ok'>();
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