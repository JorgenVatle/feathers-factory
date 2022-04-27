import { Params } from '@feathersjs/feathers';
import { FeathersServiceNotDefined } from './Errors/FeathersFactoryError';

const Clues = require('clues');

export default class Factory<FeathersService extends FactoryCompatibleService,
    Generator extends DataGenerator<Partial<Awaited<ResultType>>>, ResultType = FeathersResult<FeathersService>> {

    /**
     * Feathers service
     */
    private readonly service: FeathersService;

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
    public constructor(service: FeathersService, generator: Generator, defaultParams: Params = {}) {
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
    public async create<Overrides extends Generator>(overrides: Partial<Overrides> = {}, params?: Params): ResultType {
        const data = await this.resolveData({ ...this.generator, ...overrides });
        const parameters = await this.resolveData({ ...this.params, ...params });

        return this.service.create(data, parameters);
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
    [key in keyof T]: Awaited<ReturnType<T[key]>>;
};
export type DataGenerator<Schema> = {
    [key in keyof Schema]: Schema[key] | ((this: Schema extends Array<any>
                                                 ? Required<Schema[number]>
                                                 : Required<Schema>) => Promise<Schema[key]> | Schema[key])
}

type FactoryCompatibleService = {
    create(data: any, params?: Params): Promise<any>;
}

type FeathersResult<T extends FactoryCompatibleService> = ReturnType<T['create']>