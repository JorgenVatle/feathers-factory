import { Params, ServiceMethods } from '@feathersjs/feathers';
import Factory, { DataGenerator } from './Factory';

export default new class GlobalFactories {

    /**
     * Defined factories.
     */
    public factories: { [s: string]: Factory<any, any> } = {};

    /**
     * Define a new factory.
     *
     * @param factoryName
     * @param service
     * @param generator
     * @param defaultParams
     */
    public define(
        factoryName: string,
        service: ServiceMethods<any>,
        generator: DataGenerator<any>,
        defaultParams?: Params,
    ) {
        this.factories[factoryName] = new Factory(service, generator, defaultParams);
    }
    
    /**
     * Retrieve a factory name as defined in the define() method.
     *
     * @param name
     */
    public getFactory(name: string) {
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
    public create(factoryName: string, overrides?: DataGenerator<any>, params?: Params) {
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
    public createMany(quantity: number, factoryName: string, overrides?: DataGenerator<any>, params?: Params) {
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
    public get(factoryName: string, overrides?: DataGenerator<any>) {
        const factory = this.factories[factoryName];

        if (!factory) {
            throw Error(`Could not locate factory '${factoryName}'. Did you define it?`);
        }

        return factory.get(overrides);
    }

}