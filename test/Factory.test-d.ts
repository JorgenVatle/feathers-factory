import type { Service } from '@feathersjs/feathers';
import { describe, expectTypeOf, it } from 'vitest';
import type { FactoryService } from '../src';
import { Factory } from '../src';

describe('Factory Types', () => {
    
    describe('FactoryCompatibleService', () => {
        function createFactory<
            TSchema,
            TOutput = TSchema
        >(service: FactoryService<TSchema, TOutput>): NoInfer<(data: TSchema) => TOutput> {
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
        describe('Non-standard Service params', () => {
            const factory = new Factory({
                create(
                    data: { foo: 'bar' },
                    params: { custom: 'param' }
                ) {}
            }, { foo: 'bar', });
            
            it('allows expected params to be passed', () => {
                expectTypeOf(factory.create).toBeCallableWith({}, { custom: 'param' })
            })
            
            it('forbids unexpected params to be passed', () => {
                expectTypeOf(factory.create).toBeCallableWith({}, {
                    // @ts-expect-error
                    custom: 'param1'
                })
            })
        })
        
        describe('Standard Feathers Service params', () => {
            const factory = new Factory({} as Service<{ foo: 'bar' }>, { foo: 'bar', });
            
            it('allows expected params to be passed', () => {
                expectTypeOf(factory.create).toBeCallableWith({}, { paginate: false })
                expectTypeOf(factory.create).toBeCallableWith({}, { paginate: { max: 10 } })
            });
            
            it('forbids unexpected params to be passed', () => {
                expectTypeOf(factory.create).toBeCallableWith({}, {
                    // @ts-expect-error
                    paginate: 'invalid',
                });
                
                expectTypeOf(factory.create).toBeCallableWith({}, {
                    // @ts-expect-error
                    paginate: {},
                })
            })
        })
    })
    
    
})