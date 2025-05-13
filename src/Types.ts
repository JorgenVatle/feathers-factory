import { AdapterService } from '@feathersjs/adapter-commons';
import { Params, Service } from '@feathersjs/feathers';

export type ExtractFeathersSchema<
    T extends FactoryCompatibleService<any>
> = T extends Service<infer Schema>
    ? Schema
    : (T extends AdapterService<infer Schema>
       ? Schema
       : (T extends FactoryCompatibleService<infer Schema>
          ? Schema
          : never));

export type FactoryCompatibleService<Schema> = {
    create(data: any, params?: Params): Promise<Schema>;
}