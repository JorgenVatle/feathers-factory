import { describe, expectTypeOf, it } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';

describe('FactoryTemplate', () => {
    
    const template = new FactoryTemplate({
        _id: () => 'test',
        createdAt: () => new Date(),
        firstName: 'test',
        lastName: 'test',
    });
    
    it('can be type cast to the resulting data type', () => {
        const resolvedTemplate = template.resolve();
        
        expectTypeOf(resolvedTemplate).toEqualTypeOf<{
            _id: string;
            createdAt: Date;
            firstName: string;
            lastName: string;
        }>()
    })
    
})