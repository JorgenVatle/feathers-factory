import type { Params, Service } from '@feathersjs/feathers';
import type { FactoryService } from 'feathers-factory';
import { Factory } from 'feathers-factory';
import { describe, expectTypeOf, it } from 'vitest';

describe('Service type inference', () => {
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
    
    it('can infer types from a generic Feathers service', async () => {
        const service = {} as Service<{ foo: 'bar' }>;
        const myFactory = new Factory(service, {} as any)
        
        expectTypeOf(myFactory.create()).resolves.toEqualTypeOf<{ foo: 'bar' }>();
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
});


describe('Factory', () => {
    type ServiceType = {
        _id: string;
        createdAt: Date;
        customer: {
            firstName: string;
            lastName: string;
            address: {
                street: string;
                city: string;
            }
        },
        test: any;
    }
    const service = {
        async create(data: ServiceType) {
            return data;
        }
    }
    const factory = new Factory(service, {
        _id: () => process.hrtime().join('-'),
        createdAt: () => new Date(),
        customer: () => {
            return {
                firstName: 'John',
                lastName: 'Doe',
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                }
            }
        },
        test: () => {}
    });
    
    it('yields a fully resolved output type with the create() method', async () => {
        const result = await factory.create();
        expectTypeOf(result._id).toEqualTypeOf<string>();
        expectTypeOf(result.createdAt).toEqualTypeOf<Date>();
        expectTypeOf(result.customer).toEqualTypeOf<ServiceType['customer']>();
    })
    
    describe('Extend method', () => {
        it('can reference fields from the original template', () => {
            factory.extend({
                async test() {
                    expectTypeOf(await this.get('_id')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('createdAt')).toEqualTypeOf<Date>();
                    expectTypeOf(await this.get('customer')).toEqualTypeOf<ServiceType['customer']>();
                }
            })
        });
        
        it('does not alter the original output type', async () => {
            const result = await factory.extend({}).create();
            expectTypeOf(result._id).toEqualTypeOf<string>();
            expectTypeOf(result.createdAt).toEqualTypeOf<Date>();
            expectTypeOf(result.customer).toEqualTypeOf<ServiceType['customer']>();
        });
        
        it('can reference overridden fields from the same override object', () => {
            factory.extend({
                _id() {
                    return 'foo';
                },
                async test() {
                    expectTypeOf(await this.get('_id')).toEqualTypeOf<string>();
                }
            })
        });
    })
    
    describe('Unsafe extend method', () => {
        it('can specify new fields with unsafeExtend method', async () => {
            const newFactory = factory.unsafeExtend({
                async test2() {
                    return 'ok' as const;
                }
            });
            
            const result = await newFactory.create();
            expectTypeOf(result.test2).toEqualTypeOf<'ok'>();
        })
        
        it('can reference fields from the original template within new fields', () => {
            factory.unsafeExtend({
                async test2() {
                    expectTypeOf(await this.get('_id')).toEqualTypeOf<string>();
                }
            })
        });
        
        it('does not alter output types for fields not explicitly overridden', async () => {
            const result = await factory.unsafeExtend({}).create();
            expectTypeOf(result._id).toEqualTypeOf<string>();
            expectTypeOf(result.createdAt).toEqualTypeOf<Date>();
            expectTypeOf(result.customer).toEqualTypeOf<ServiceType['customer']>();
        })
    })
})

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
        type DocumentType = { foo: 'bar' };
        const factory = new Factory({} as Service<DocumentType, DocumentType, Params<DocumentType>>, { foo: 'bar', });
        
        it('allows expected params to be passed', () => {
            expectTypeOf(factory.create).toBeCallableWith({}, { paginate: false })
            expectTypeOf(factory.create).toBeCallableWith({}, { paginate: { max: 10 } })
        });
        
        it('forbids unexpected params to be passed', () => {
            expectTypeOf(factory.create).toBeCallableWith({}, {
                query: {
                    // @ts-expect-error
                    foo: 'invalid',
                }
            });
            
            expectTypeOf(factory.create).toBeCallableWith({}, {
                query: {
                    // @ts-expect-error
                    unknownField: 'invalid',
                }
            })
        })
    })
});

