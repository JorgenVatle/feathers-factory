import { Params, Service } from '@feathersjs/feathers';
import Factory, { DataGenerator } from './Factory';

class FeathersFactory {

    /**
     * Defined factories.
     */
    private factories: { [s: string]: Factory } = {};

    /**
     * Define a new factory.
     *
     * @param factoryName
     * @param service
     * @param generator
     */
    public define(factoryName: string, service: Service<any>, generator: DataGenerator) {
        this.factories[factoryName] = new Factory(service, generator);
    }

    /**
     * Run factory, creating entry in Feathers service.
     *
     * @param factoryName
     * @param overrides
     * @param params
     */
    public create(factoryName: string, overrides?: DataGenerator, params?: Params) {
        return this.factories[factoryName].create(overrides, params);
    }

}

export default new FeathersFactory();