import { Params } from '@feathersjs/feathers';
import Clues from 'clues';
import { FeathersServiceNotDefined } from './Errors/FeathersFactoryError';
import { type DataGenerator, FactoryDataGenerator } from './FactoryDataGenerator';
import type { FactoryCompatibleService } from './Types';

export default class Factory<
    TSchema,
    TResult = TSchema,
    TFactory extends Record<string, unknown> = {},
> {
    protected generator: FactoryDataGenerator<any, { data: TSchema, params: Params }>;
    
    /**
     * Factory constructor.
     *
     * @param service
     * @param generator
     * @param defaultParams
     */
    public constructor(
        private readonly service: FactoryCompatibleService<TSchema, TResult>,
        generator: DataGenerator<TSchema, TFactory>,
        defaultParams: DataGenerator<Params> = {},
    ) {
        if (!service) {
            throw new FeathersServiceNotDefined('The provided service doesn\'t appear to exist!');
        }
        this.generator = new FactoryDataGenerator({
            data: generator,
            params: defaultParams,
        });
    }
    
    /**
     * Store generated data to the Feathers service.
     *
     * @param overrides
     * @param params
     */
    public async create(
        overrides?: DataGenerator<TSchema>,
        params?: DataGenerator<Params>,
    ): Promise<TResult> {
        const result = await this.generator.resolve({
            data: overrides,
            params: params,
        });
        
        return this.service.create(result.data, result.parameters) as Promise<TResult>;
    }
    
    /**
     * Quickly populate the database running the factory a number of times.
     */
    public createMany(
        quantity: number,
        overrides?: DataGenerator<TSchema>,
        params?: DataGenerator<Params>,
    ): Promise<TResult[]> {
        const promises: Promise<TResult>[] = [];
        
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
    public get(overrides: Partial<DataGenerator<TSchema>> = {}) {
        return this.resolveData({ ...this.generator, ...overrides }) as Promise<TSchema>;
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

