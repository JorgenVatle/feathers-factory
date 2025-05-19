import { describe, expectTypeOf, it } from 'vitest';
import { defineTemplateSchema, type TemplateSchema } from './FactoryTemplate-v2';

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
})

describe('TemplateSchema type alias', () => {
    function createTemplateSchema<
        TSchema extends Record<string, unknown>
    >(schema: TemplateSchema<TSchema>) {}
    
    it(`Exposes types of sibling fields through each field's context parameter`, () => {
        createTemplateSchema({
            arrowFunction: () => 'ok' as const,
            asyncPromise: async () => 'ok' as const,
            asyncDate: async () => new Date(),
            
            test: (ctx) => {
                expectTypeOf(ctx.arrowFunction).toEqualTypeOf<'ok'>();
                expectTypeOf(ctx.arrowFunction).toEqualTypeOf<'ok'>();
                expectTypeOf(ctx.asyncPromise).toEqualTypeOf<Promise<'ok'>>();
                expectTypeOf(ctx.asyncDate).toEqualTypeOf<Promise<Date>>();
                
                return 'ok';
            }
        })
        
    })
})