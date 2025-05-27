import { Params } from '@feathersjs/feathers';
import type { HasBeenAugmented } from '../lib/Utilities';
import type { SchemaOverrides } from '../Template';
import { Factory } from './index';


/**
 * We are intentionally leaving this empty here so you can add type
 * declarations for globally accessible factories.
 *
 * @example
 * const MyUserFactory = new Factory(...);
 *
 * declare module 'feathers-factory' {
 *     interface GlobalFactories {
 *          'user-factory': typeof MyUserFactory
 *     }
 * }
 */
export interface GlobalFactories {

}


class GlobalFactoryManager {

    /**
     * Defined factories.
     */
    public factories = {} as FactoryRegistry;

    /**
     * Define a new factory.
     */
    public define<
        TSchema,
        TResult = TSchema,
    >(
        factoryName: FactoryName,
        factory: Factory<TSchema, TResult>,
    ) {
        this.factories[factoryName] = factory;
    }
    
    /**
     * Retrieve a factory name as defined in the define() method.
     *
     * @param name
     */
    public getFactory<TName extends FactoryName>(name: TName): GlobalFactory<TName> {
        const factory = this.factories[name];
    
        if (!factory) {
            throw Error(`Could not locate factory '${name}'. Did you define it?`);
        }
        
        return factory;
    }
    

    /**
     * Run factory, creating entry in Feathers service.
     *
     * @param factoryName
     * @param overrides
     * @param params
     */
    public create<
        TName extends FactoryName
    >(factoryName: TName, overrides?: GlobalFactoryOverrides<TName>, params?: Params) {
        const factory = this.getFactory(factoryName);

        return factory.create(overrides, params);
    }

    /**
     * Run a number of factories, creating entries in Feathers service.
     *
     * @param quantity
     * @param factoryName
     * @param overrides
     * @param params
     */
    public createMany<
        TName extends FactoryName
    >(quantity: number, factoryName: TName, overrides?: GlobalFactoryOverrides<TName>, params?: Params) {
        const factory = this.getFactory(factoryName);
        return factory.createMany(quantity, overrides, params);
    }

    /**
     * Run factory without creating entry in Feathers service.
     * Returns resolved data object.
     *
     * @param factoryName
     * @param overrides
     */
    public get<
        TName extends FactoryName
    >(factoryName: TName, overrides?: GlobalFactoryOverrides<TName>) {
        const factory = this.factories[factoryName];

        if (!factory) {
            throw Error(`Could not locate factory '${factoryName}'. Did you define it?`);
        }

        return factory.resolve(overrides);
    }

}

export const GlobalFactories = new GlobalFactoryManager();

type FactoryName = keyof FactoryRegistry;
type GlobalFactory<TName extends FactoryName> = FactoryRegistry[TName];

type GlobalFactoryOverrides<
    TName extends FactoryName
> = GlobalFactory<TName> extends Factory<infer TSchema, infer TResult>
    ? SchemaOverrides<TSchema>
    : never;

type FactoryRegistry = HasBeenAugmented<GlobalFactories> extends true
                       ? GlobalFactories
                       : DefaultFactoryRegistry

type DefaultFactoryRegistry = {
    [key: string]: Factory<any, any>;
}

