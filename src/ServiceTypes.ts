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
> = FactoryCompatibleService<TSchema, TResult>

export interface FactoryCompatibleService<
    TSchema,
    TResult = TSchema,
    
    TData = TSchema | TSchema[],
    TReturn = TResult | TResult[],
> {
    create(data: TData, params?: Params): TReturn | Promise<TReturn>;
}
