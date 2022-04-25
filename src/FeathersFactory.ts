import { Params, ServiceMethods } from '@feathersjs/feathers';
import Factory, { DataGenerator } from './Factory';

class FeathersFactory {

    /**
     * Defined factories.
     */
    private factories: { [s: string]: Factory<any> } = {};

    /**
     * Define a new factory.
     *
     * @param factoryName
     * @param service
     * @param generator
     * @param defaultParams
     */
    public define(factoryName: string, service: ServiceMethods<any>, generator: DataGenerator, defaultParams?: Params) {
        this.factories[factoryName] = new Factory(service, generator, defaultParams);
    }

    /**
     * Run factory, creating entry in Feathers service.
     *
     * @param factoryName
     * @param overrides
     * @param params
     */
    public create(factoryName: string, overrides?: DataGenerator, params?: Params) {
        const factory = this.factories[factoryName];

        if (!factory) {
            throw Error(`Could not locate factory '${factoryName}'. Did you define it?`);
        }

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
    public createMany(quantity: number, factoryName: string, overrides?: DataGenerator, params?: Params) {
        const created = [];

        for (let i = 0; i < quantity; i++) {
            created.push(this.create(factoryName, overrides, params));
        }

        return Promise.all(created);
    }

    /**
     * Run factory without creating entry in Feathers service.
     * Returns resolved data object.
     *
     * @param factoryName
     * @param overrides
     */
    public get(factoryName: string, overrides?: DataGenerator) {
        const factory = this.factories[factoryName];

        if (!factory) {
            throw Error(`Could not locate factory '${factoryName}'. Did you define it?`);
        }

        return factory.get(overrides);
    }

}

export default new FeathersFactory();