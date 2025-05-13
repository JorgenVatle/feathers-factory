import { Params } from '@feathersjs/feathers';

export type FactoryCompatibleService<
    TSchema = any,
    TResult = TSchema
> = {
    create: (data: TSchema, params?: Params) => TResult | Promise<TResult>;
}