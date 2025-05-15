import { describe, expectTypeOf, it } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';

describe('FactoryTemplate', () => {
    
    
    const template = new FactoryTemplate({
        _id: () => 'test',
        createdAt: () => new Date(),
        firstName: 'test',
        lastName: 'test',
    });
    
    describe('Resolved data types', async () => {
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
    
    describe('Overrides', () => {
        
        it('allows partial overrides', async () => {
            expectTypeOf(template.resolve).parameter(1).toBeCallableWith({
                _id: () => 'test',
            })
        })
        
        it('has to adhere to the original schema', () => {
            expectTypeOf(template.resolve).parameter(1).not.toBeCallableWith({
                _id: () => 'INVALID_ID',
            })
        })
        
    })
    
})