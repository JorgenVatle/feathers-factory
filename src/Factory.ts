import { Params } from '@feathersjs/feathers';
import { FeathersServiceNotDefined } from './Errors/FeathersFactoryError';
import type { ExtractFeathersSchema, FactoryCompatibleService } from './Types';

const Clues = require('clues');

export default class Factory<
    FeathersService extends FactoryCompatibleService<any>,
    Schema extends ExtractFeathersSchema<FeathersService>
> {
    
    /**
     * Factory constructor.
     *
     * @param service
     * @param generator
     * @param defaultParams
     */
    public constructor(
        private readonly service: FeathersService,
        private readonly generator: DataGenerator<Schema>,
        private readonly defaultParams: DataGenerator<Params> = {},
    ) {
        if (!service) {
            throw new FeathersServiceNotDefined('The provided service doesn\'t appear to exist!');
        }
    }
    
    /**
     * Store generated data to the Feathers service.
     *
     * @param overrides
     * @param params
     */
    public async create(
        overrides?: Partial<DataGenerator<Schema>>,
        params?: Params,
    ): Promise<Schema> {
        const data = await this.resolveData({ ...this.generator, ...overrides });
        const parameters = await this.resolveData({ ...this.defaultParams, ...params });
        
        return this.service.create(data, parameters);
    }
    
    /**
     * Quickly populate the database running the factory a number of times.
     */
    public createMany(
        quantity: number,
        overrides?: Partial<DataGenerator<Schema>>,
        params?: Params,
    ): Promise<Schema[]> {
        const promises: Promise<Schema>[] = [];
        
        for (let i = 0; i < quantity; i++) {
            promises.push(this.create(overrides, params));
        }
        
        return Promise.all(promises);
    }
    
    /**
     * Just resolve a predefined DataGenerator object.
     *
     * @param overrides
     */
    public get(overrides: Partial<DataGenerator<Schema>> = {}) {
        return this.resolveData({ ...this.generator, ...overrides }) as Promise<Schema>;
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
    
}

type GeneratorValue<SchemaValue, ThisType> = SchemaValue | ((this: ThisType) => SchemaValue | Promise<SchemaValue>)

export type DataGenerator<Schema> = {
    [key in keyof Schema]: GeneratorValue<Schema[key], Schema>
}