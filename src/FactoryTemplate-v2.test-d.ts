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
    })
});

describe('FactoryTemplateV2', () => {
    
    it('exposes return types of sibling functions through a context parameter', () => {
        const template = new FactoryTemplateV2({
            arrowFunction: () => 'ok' as const,
            asyncPromise: async () => 'ok' as const,
            asyncDate: () => new Date(),
            
            test(ctx) {
                expectTypeOf(ctx.arrowFunction).toEqualTypeOf<'ok'>();
                expectTypeOf(ctx.asyncPromise).toEqualTypeOf<Promise<'ok'>>();
                expectTypeOf(ctx.asyncDate).toEqualTypeOf<Date>();
            }
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