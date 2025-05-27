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
    public readonly paramsTemplate: FactoryTemplate<TParams>;
    
    /**
     * Factory constructor.
     * @param service Feathers-compatible service to send created data to.
     *     A Feathers-compatible service is any object that has a create()
     *     method. 😁
     * @param template Factory template. Defines a set of functions or static
     *     values to be run every time the factory is executed.
     * @param defaultParams Optional template for generating {@link Params} to
     *     be used when creating data for your service.
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
        
        this.paramsTemplate = new FactoryTemplate(defaultParams);
    }
    
    /**
     * Generates data using the provided template and sends it to the
     * configured service's create() method.
     *
     * @param data Replaces fields in the default factory template. Can be
     *      functions or static values. Useful if you have a field that has
     *      some side effects that you want to override or already have the
     *      output for.
     * @param params Optional params to send to the service. Can also be either
     *      functions or static values. Functions are called and replaced with
     *      their return type.
     * @see {@link https://feathersjs.com/guides/basics/services.html#service-methods Feathers Service.create()}
     */
    public async create(
        data?: TemplateSchemaOverrides<TSchema>,
        params?: TemplateSchemaOverrides<TParams>,
    ): Promise<TResult> {
        const resolvedData: any = await this.resolve(data);
        const resolvedParams = await this.paramsTemplate.resolve(params);
        
        return this.service.create(resolvedData, resolvedParams as TParams) as Promise<TResult>;
    }
    
    /**
     * Quickly populate the database running the factory a number of times.
     *
     * @param quantity The number of times to run the factory. Or rather,
     *      how many documents do you want inserted into the database.
     * @param overrides Replaces fields in the default factory template. Can be
     *      functions or static values. Useful if you have a field that has
     *      some side effects that you want to override or already have the
     *      output for.
     * @param params Optional params to send to the service. Can also be either
     *      functions or static values. Functions are called and replaced with
     *      their return type.
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
     * @param overrides Replaces fields in the default factory template. Can be
     *      functions or static values. Useful if you have a field that has
     *      some side effects that you want to override or already have the
     *      output for.
     */
    public resolve(overrides: TemplateSchemaOverrides<TSchema> = {}): Promise<TResult> {
        // @ts-expect-error type mismatch
        return this.template.resolve(overrides);
    }
    
}

