import { Params } from '@feathersjs/feathers';


/**
 * Utility type for any Feathers or class that implements
 * an interface compatible with Feathers Factory.
 * @param TSchema The expected input type for the service create() method.
 * @param TResult The return type for the provided service class
 */
export type FactoryService<
    TSchema = unknown,
    TResult = TSchema,
    TParams = Params,
> = FactoryCompatibleService<TSchema, TResult, TParams>

export interface FactoryCompatibleService<
    TSchema,
    TResult = TSchema,
    TParams = Params,
    
    TData = TSchema | TSchema[],
    TReturn = TResult | TResult[],
> {
    create(data: TData, params?: TParams): TReturn | Promise<TReturn>;
}
