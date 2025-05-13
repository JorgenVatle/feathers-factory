import type { Service } from '@feathersjs/feathers';
import { describe, expectTypeOf, it } from 'vitest';
import Factory from './Factory';

describe('Factory Types', () => {
    
    it('can infer types from a generic Feathers service', async () => {
        const service = {} as Service<{ foo: 'bar' }>;
        const myFactory = new Factory(service, {} as any)
        
        expectTypeOf(myFactory.create()).resolves.toEqualTypeOf<{ foo: 'bar' }>();
    });
    
    it('can fall back to the service create() data type for non-Feathers services', async () => {
        const service = {
            async create(data: { foo: 'bar' }) {
                return data;
            }
        };
        const myFactory = new Factory(service, {} as any)
        
        expectTypeOf(myFactory.create()).resolves.toEqualTypeOf<{ foo: 'bar' }>();
    })
    
})