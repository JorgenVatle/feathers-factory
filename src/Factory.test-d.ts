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
    
    it(`disallows generator types that don't match the underlying schema `, () => {
        const service = {} as Service<{
            stringField: string,
            numberField: number,
        }>;
        
        const factory = new Factory(service, {
            // @ts-expect-error
            stringField: 1,
            
            // @ts-expect-error
            numberField: () => 'foobar'
        });
    })
    
})