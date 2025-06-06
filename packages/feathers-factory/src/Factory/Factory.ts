import { Params } from '@feathersjs/feathers';
import { ServiceNotDefined } from '../Errors';
import {
    FactoryTemplate,
    type InferOutput,
    type SchemaField,
    type SchemaOverrides,
    type TemplateSchema,
} from '../Template';
import type { ExtendSchema } from '../Template/Schema';
import type { FactoryCompatibleService } from './ServiceTypes';

export class Factory<
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
            throw new ServiceNotDefined('The provided service doesn\'t appear to exist!');
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
     * @param overrides Replaces fields in the default factory template. Can be
     *      functions or static values. Useful if you have a field that has
     *      some side effects that you want to override or already have the
     *      output for.
     * @param params Optional params to send to the service. Can also be either
     *      functions or static values. Functions are called and replaced with
     *      their return type.
     * @see {@link https://feathersjs.com/guides/basics/services.html#service-methods Feathers Service.create()}
     */
    public async create<
        TDataOverrides,
        TParamsOverrides,
    >(
        overrides?: SchemaOverrides<TSchema, TDataOverrides>,
        params?: SchemaOverrides<TParams, TParamsOverrides>,
    ): Promise<{
        [key in keyof TSchema]-?: key extends keyof TDataOverrides ? TDataOverrides[key] : TSchema[key]
    }> {
        const resolvedData: any = await this.resolve(overrides);
        const resolvedParams = await this.paramsTemplate.resolve(params) as TParams;
        
        // @ts-expect-error Type mismatch.
        return this._create(resolvedData, resolvedParams);
    }
    
    /**
     * Internal create method. Useful if you need to extend the Factory class
     * to add your own functionality or error handling without changing the
     * type signature of the user-facing create method.
     * {@inheritDoc Factory.create}
     * @see {@link Factory.create}
     * @example
     * class CustomFactory<TSchema, TResult, TParams> extends Factory<TSchema, TResult, TParams> {
     *     protected _create(data, params) {
     *         try {
     *             return super._create(data, params)
     *         } catch (error) {
     *             // ...
     *         } finally {
     *             // ...
     *         }
     *     }
     * }
     */
    protected async _create(
        data: TSchema,
        params: TParams,
    ): Promise<TResult> {
        return this.service.create(data, params) as Promise<TResult>;
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
        overrides?: SchemaOverrides<TSchema>,
        params?: SchemaOverrides<TParams>,
    ): Promise<TResult[]> {
        const promises: Promise<TResult>[] = [];
        
        for (let i = 0; i < quantity; i++) {
            // @ts-expect-error Type mismatch.
            promises.push(this.create(overrides, params));
        }
        
        return Promise.all(promises);
    }
    
    /**
     * Create a new factory using the current one as the basis for the next one.
     *
     * @param overrides Replaces fields in the default factory template. Can be
     *      functions or static values. Useful if you have a field that has
     *      some side effects that you want to override or already have the
     *      output for.
     * @param params Optional params to send to the service. Can also be either
     *      functions or static values. Functions are called and replaced with
     *      their return type.
     */
    public extend<
        TDataOverrides,
        TParamsOverrides,
    >(
        overrides: SchemaOverrides<TSchema, TDataOverrides>,
        params?: SchemaOverrides<TParams, TParamsOverrides>
    ): Factory<TSchema, TResult, TParams> {
        // @ts-expect-error This overrides the expected type from the service.
        return new Factory(this.service, this.template.extend(overrides), this.paramsTemplate.extend(params));
    }
    
    /**
     * Create a new factory using the current one as the basis for the next one.
     * The difference from {@link extend} is that this method will allow you to
     * specify field types that are not otherwise allowed by the service.
     *
     * @param overrides Replaces fields in the default factory template. Can be
     *      functions or static values. Useful if you have a field that has
     *      some side effects that you want to override or already have the
     *      output for.
     * @param params Optional params to send to the service. Can also be either
     *      functions or static values. Functions are called and replaced with
     *      their return type.
     */
    public unsafeExtend<
        TDataOverrides,
        TParamsOverrides,
        
        TTemplateOutput = {} extends TDataOverrides ? TSchema : Omit<TSchema, keyof TDataOverrides> & InferOutput<TDataOverrides>,
        TParamsOutput = Omit<TParams, keyof TParamsOverrides> & InferOutput<TParamsOverrides>,
    >(
        overrides: ExtendSchema<TSchema, TDataOverrides>,
        params?: ExtendSchema<TParams, TParamsOverrides>
    ): Factory<TTemplateOutput, TTemplateOutput, TParamsOutput> {
        // @ts-expect-error This overrides the expected type from the service.
        return new Factory(this.service, this.template.extend(overrides), this.paramsTemplate.extend(params));
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
    public resolve(overrides: SchemaOverrides<TSchema> = {}): Promise<TResult> {
        // @ts-expect-error type mismatch
        return this.template.resolve(overrides);
    }
    
}

