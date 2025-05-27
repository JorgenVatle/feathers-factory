import { Params } from '@feathersjs/feathers';
import { FeathersServiceNotDefined } from './Errors/FeathersFactoryError';
import type { FactoryCompatibleService } from './ServiceTypes';
import { FactoryTemplate, type SchemaField, type TemplateSchema, type TemplateSchemaOverrides } from './Template';

export default class Factory<
    TSchema,
    TResult = TSchema,
    TParams = Params,
> {
    public readonly template: FactoryTemplate<TSchema>;
    protected readonly params: FactoryTemplate<Params>;
    
    /**
     * Factory constructor.
     */
    public constructor(
        private readonly service: FactoryCompatibleService<TSchema, TResult, TParams>,
        template: TemplateSchema<{
            [key in keyof TSchema]: SchemaField<TSchema[key]>
        }> | FactoryTemplate<{
            [key in keyof TSchema]: SchemaField<TSchema[key]>
        }>,
        defaultParams: TemplateSchema<TParams> = {} as any,
    ) {
        if (!service) {
            throw new FeathersServiceNotDefined('The provided service doesn\'t appear to exist!');
        }
        
        if (template instanceof FactoryTemplate) {
            // @ts-expect-error mismatched types
            this.template = template;
        } else {
            // @ts-expect-error mismatched types
            this.template = new FactoryTemplate(template);
        }
        
        this.params = new FactoryTemplate(defaultParams);
    }
    
    /**
     * Store generated data to the Feathers service.
     */
    public async create(
        data?: TemplateSchemaOverrides<TSchema>,
        params?: TemplateSchemaOverrides<TParams>,
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
        overrides?: TemplateSchemaOverrides<TSchema>,
        params?: TemplateSchemaOverrides<TParams>,
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
    public get(overrides: TemplateSchemaOverrides<TSchema> = {}): Promise<TResult> {
        // @ts-expect-error type mismatch
        return this.template.resolve(overrides);
    }
    
}

