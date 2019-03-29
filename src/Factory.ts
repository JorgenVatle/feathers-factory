import { Service } from '@feathersjs/feathers';
const Clues = require('clues');

export type DataGenerator = {
    [s: string]: () => any | Promise<any> | any,
}

export default class Factory {

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
     * @param service
     * @param generator
     */
    public constructor(service: Service<any>, generator: DataGenerator) {
        this.service = service;
        this.generator = generator;
    }

    /**
     * Resolve data from a data generator object.
     *
     * @param data
     */
    private resolveData(data: DataGenerator) {
        const output: { [s: string]: any } = {};

        const resolveData = Object.keys(this.generator).map((key: string) => {
            return Clues(this.generator, key);
        });

        return Promise.all(resolveData)
    }

    /**
     * Store generated data to the Feathers service.
     *
     * @param overrides
     */
    public async create(overrides: { [s: string]: any } = {}) {
        const data = {
            ...await this.resolveData(this.generator),
            ...await this.resolveData(overrides),
        };

        return await this.service.create(overrides);
    }

}