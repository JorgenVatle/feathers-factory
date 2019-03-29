import { Service } from '@feathersjs/feathers';

type DataGenerator = {
    [s: string]: () => any | Promise<any> | any,
}

export default class Factory {

    /**
     * Factory name.
     */
    private readonly factoryName: string;

    /**
     * Feathers service
     */
    private readonly service: Service<any>;

    /**
     * Factory data generator.
     */
    private readonly generator: DataGenerator;

    /**
     * Factory constructor.
     *
     * @param factoryName
     * @param service
     * @param generator
     */
    constructor(factoryName: string, service: Service<any>, generator: DataGenerator) {
        this.factoryName = factoryName;
        this.service = service;
        this.generator = generator;
    }

}