import { Params } from '@feathersjs/feathers';
import { FeathersServiceNotDefined } from './Errors/FeathersFactoryError';
import { FactoryTemplate, type TemplateOverrides, type TemplateSchema } from './FactoryTemplate';
import type { FactoryCompatibleService } from './ServiceTypes';

export default class Factory<
    TSchema,
    TResult = TSchema,
    TParams = Params,
> {
    protected readonly data: FactoryTemplate<TSchema>;
    protected readonly params: FactoryTemplate<Params>;
    
    /**
     * Factory constructor.
     */
    public constructor(
        private readonly service: FactoryCompatibleService<TSchema, TResult, TParams>,
        data: TemplateSchema<TSchema> | FactoryTemplate<TSchema>,
        defaultParams: TemplateSchema<TParams> = {} as any,
    ) {
        if (!service) {
            throw new FeathersServiceNotDefined('The provided service doesn\'t appear to exist!');
        }
        
        if (data instanceof FactoryTemplate) {
            this.data = data;
        } else {
            this.data = new FactoryTemplate(data);
        }
        
        this.params = new FactoryTemplate(defaultParams);
    }
    
    /**
     * Store generated data to the Feathers service.
     */
    public async create(
        data?: TemplateOverrides<TSchema>,
        params?: TemplateOverrides<TParams>,
    ): Promise<TResult> {
        const resolvedData: any = await this.get(data);
        const resolvedParams = await this.params.resolve(params);
        
        return this.service.create(resolvedData, resolvedParams as TParams) as Promise<TResult>;
    }
    
    /**
     * Quickly populate the database running the factory a number of times.
     */
    public createMany(
        quantity: number,
        overrides?: TemplateOverrides<TSchema>,
        params?: TemplateOverrides<TParams>,
    ): Promise<TResult[]> {
        const promises: Promise<TResult>[] = [];
        
        for (let i = 0; i < quantity; i++) {
            promises.push(this.create(overrides, params));
        }
        
        return Promise.all(promises);
    }
    
    /**
     * Just resolve a predefined factory template without inserting it into
     * the underlying service.
     *
     * @param overrides
     */
    public get(overrides: TemplateOverrides<TSchema> = {}) {
        return this.data.resolve(overrides);
    }
    
}

