import { describe, expectTypeOf, it } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';

describe('FactoryTemplate', () => {
    
    
    describe('Resolved data types', async () => {
        const template = new FactoryTemplate({
            _id: () => 'test',
            createdAt: () => new Date(),
            firstName: 'test',
            lastName: 'test',
        });
        const resolvedTemplate = await template.resolve();
        
        it('will unwrap functions to their return values', async () => {
            expectTypeOf(resolvedTemplate._id).toEqualTypeOf<'test'>();
            expectTypeOf(resolvedTemplate.createdAt).toEqualTypeOf<Date>();
        });
        
        it('will not unwrap non-function values', async () => {
            expectTypeOf(resolvedTemplate.firstName).toEqualTypeOf<string>();
            expectTypeOf(resolvedTemplate.lastName).toEqualTypeOf<string>();
        })
        
    })
    
})