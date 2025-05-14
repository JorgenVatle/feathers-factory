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
    protected readonly data: FactoryDataGenerator<TSchema, TFactory>;
    protected readonly params: FactoryDataGenerator<Params, Record<keyof Params, any>>;
    
    /**
     * Factory constructor.
     */
    public constructor(
        private readonly service: FactoryCompatibleService<TSchema, TResult>,
        data: DataGenerator<TSchema, TFactory>,
        defaultParams: DataGenerator<Params> = {},
    ) {
        if (!service) {
            throw new FeathersServiceNotDefined('The provided service doesn\'t appear to exist!');
        }
        
        this.data = new FactoryDataGenerator(data);
        this.params = new FactoryDataGenerator(defaultParams);
    }
    
    /**
     * Store generated data to the Feathers service.
     */
    public async create(
        data?: Partial<DataGenerator<TSchema>>,
        params?: Params,
    ): Promise<TResult> {
        const resolvedData: any = await this.get(data);
        const resolvedParams = await this.params.resolve(params);
        
        return this.service.create(resolvedData, resolvedParams) as Promise<TResult>;
    }
    
    /**
     * Quickly populate the database running the factory a number of times.
     */
    public createMany(
        quantity: number,
        overrides?: Partial<DataGenerator<TSchema>>,
        params?: Params,
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
        return this.data.resolve(overrides);
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

