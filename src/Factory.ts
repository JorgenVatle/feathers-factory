import { Params, Service } from '@feathersjs/feathers';
const Clues = require('clues');

export type DataGenerator = {
    [s: string]: any,
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
     * Default service create() params.
     */
    private readonly params: Params;

    /**
     * Factory constructor.
     *
     * @param service
     * @param generator
     * @param defaultParams
     */
    public constructor(service: Service<any>, generator: DataGenerator, defaultParams: Params = {}) {
        this.service = service;
        this.generator = generator;
        this.params = defaultParams;
    }


    /**
     * Resolve data from a data generator object.
     *
     * @param data
     */
    private async resolveData(data: DataGenerator) {
        const output: { [s: string]: any } = {};

        const resolveData = Object.keys(data).map(async (key: string) => {
            output[key] = await Clues(data, key);
        });

        await Promise.all(resolveData);

        return output;
    }

    /**
     * Store generated data to the Feathers service.
     *
     * @param overrides
     * @param params
     */
    public async create(overrides: { [s: string]: any } = {}, params?: Params) {
        const data = await this.resolveData({ ...this.generator, ...overrides, });
        const parameters = await this.resolveData({ ...this.params, ...params });

        return await this.service.create(data, parameters);
    }

}