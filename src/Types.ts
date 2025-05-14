import { Params } from '@feathersjs/feathers';


export interface FactoryCompatibleService<
    TSchema,
    TResult = TSchema,
    
    TData = TSchema | TSchema[],
    TReturn = TResult | TResult[],
> {
    create(data: TData, params?: Params): TReturn | Promise<TReturn>;
}
