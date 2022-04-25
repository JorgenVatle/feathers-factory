import { Params, ServiceMethods } from '@feathersjs/feathers';
import { FeathersServiceNotDefined } from './Errors/FeathersFactoryError';

const Clues = require('clues');

export default class Factory<Schema extends GeneratorSchema = GeneratorSchema,
    Generator extends DataGenerator<Schema> = DataGenerator<Schema>> {

    /**
     * Feathers service
     */
    private readonly service: ServiceMethods<any>;

    /**
     * Factory data generator.
     */
    private readonly generator: Generator;

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
    public constructor(service: ServiceMethods<any>, generator: Generator, defaultParams: Params = {}) {
        if (!service) {
            throw new FeathersServiceNotDefined('The provided service doesn\'t appear to exist!');
        }
        this.service = service;
        this.generator = generator;
        this.params = defaultParams;
    }


    /**
     * Resolve data from a data generator object.
     *
     * @param data
     */
    private async resolveData(data: any) {
        const output: { [s: string]: any } = {};

        const dataResolvers = Object.keys(data).map(async (key: string) => {
            output[key] = await Clues(data, key);
        });

        await Promise.all(dataResolvers);

        return output;
    }

    /**
     * Store generated data to the Feathers service.
     *
     * @param overrides
     * @param params
     */
    public async create<Overrides extends Generator>(overrides: Partial<Overrides> = {}, params?: Params) {
        const data = await this.resolveData({ ...this.generator, ...overrides });
        const parameters = await this.resolveData({ ...this.params, ...params });

        return await this.service.create(data, parameters) as Promise<GeneratorResult<Generator & Overrides>>;
    }

    /**
     * Just resolve a predefined DataGenerator object.
     *
     * @param overrides
     */
    public get<Overrides extends Generator>(overrides: Partial<Overrides> = {}) {
        return this.resolveData({ ...this.generator, ...overrides }) as Promise<GeneratorResult<Generator & Overrides>>;
    }

}

type GeneratorResult<T extends DataGenerator<any>> = {
    [key in keyof T]: T[key] extends () => any ? Awaited<ReturnType<T[key]>> : T[key];
};
type GeneratorSchema = { [s: string]: any }
export type DataGenerator<Schema extends GeneratorSchema = GeneratorSchema> = {
    [key in keyof Schema]: Schema[key]
                           | ((this: GeneratorFunctionThisType<Schema>) => Promise<Schema[key]>)
                           | ((this: GeneratorFunctionThisType<Schema>) => Schema[key])
}

type GeneratorFunctionThisType<Schema extends GeneratorSchema> = {
    [key in keyof Schema]: Promise<Schema[key]>;
}