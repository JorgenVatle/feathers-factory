import { describe, expectTypeOf, it } from 'vitest';
import { defineTemplateSchema } from './FactoryTemplate-v2';

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