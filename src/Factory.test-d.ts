import type { Service } from '@feathersjs/feathers';
import { describe, expectTypeOf, it } from 'vitest';
import Factory from './Factory';
import type { FactoryCompatibleService } from './Types';

/**
 * Generic feathers services modify the schema you provide
 * with something way too loose. This mimics that behaviour.
 */
type GenericFeathersDataInput<T> = Partial<T> | Partial<T>[];
type GenericFeathersDataOutput<T> = T | T[];

describe('Factory Types', () => {
    
    describe('FactoryCompatibleService', () => {
        
        function createFactory<
            TSchema,
            TOutput = TSchema
        >(service: FactoryCompatibleService<TSchema, TOutput>): NoInfer<(data: TSchema) => TOutput> {
            return {} as any;
        }
        
        it('is compatible with Feathers services', () => {
            type Schema = { foo: 'bar' }
            const service = {} as Service<Schema>;
            const create = createFactory(service);
            
            
            expectTypeOf(create).parameter(0)
                .toEqualTypeOf<GenericFeathersDataInput<Schema>>();
        })
        
    })
    
    it('can infer types from a generic Feathers service', async () => {
        const service = {} as Service<{ foo: 'bar' }>;
        const myFactory = new Factory(service, {} as any)
        
        expectTypeOf(myFactory.create()).resolves
            .toEqualTypeOf<GenericFeathersDataOutput<{ foo: 'bar' }>>();
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
        
        new Factory(service, {
            // @ts-expect-error
            stringField: 1,
            
            // @ts-expect-error
            numberField: () => 'foobar'
        });
    })
    
})