import type { Service } from '@feathersjs/feathers';
import { describe, expectTypeOf, it } from 'vitest';
import Factory from '../src/Factory';
import type { FactoryCompatibleService } from '../src/ServiceTypes';

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
            
            expectTypeOf(create)
                .parameter(0)
                .toEqualTypeOf<Partial<Schema>>();
        })
        
    })
    
    it('can infer types from a generic Feathers service', async () => {
        const service = {} as Service<{ foo: 'bar' }>;
        const myFactory = new Factory(service, {} as any)
        
        expectTypeOf(myFactory.create()).resolves
            .toEqualTypeOf<{ foo: 'bar' }>();
    });
    
    it('can fall back to the service create() data type for non-Feathers services', async () => {
        const service = {
            async create(data: { foo: 'bar' }) { return data }
        };
        const myFactory = new Factory(service, {} as any);
        
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
    });
    
    
    describe('Service params', () => {
        it('will infer non-standard params types', () => {
            const customService = {
                create(data: { foo: 'bar' }, params: { custom: 'param' }) {}
            }
            const factory = new Factory(customService, { foo: 'bar', });
            
            // @ts-expect-error
            factory.create({}, { custom: 'invalid' })
            factory.create({}, { custom: 'param' });
        })
        
        it('will infer standard params types', () => {
            const factory = new Factory({} as Service<{ foo: 'bar' }>, { foo: 'bar', });
            
            // @ts-expect-error
            factory.create({}, { paginate: 'invalid' })
            factory.create({}, { custom: 'param' });
        })
    })
    
    
})