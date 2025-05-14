import Factory from './Factory';
import type { GeneratorSchema, ResolvedFactory } from './FactoryDataGenerator';
import type { FactoryService } from './Types';


export function createMockServiceFactory<
    TFactoryProps extends GeneratorSchema,
    TSchema extends GeneratorSchema = ResolvedFactory<TFactoryProps>
>(factory: TFactoryProps): {
    service: FactoryService<TSchema, TSchema>;
    factory: Factory<TSchema, TFactoryProps>;
} {
    const service = {
        create(data: TSchema) {
            return data;
        }
    };
    return {
        service,
        factory: new Factory(service, factory),
    } as any;
}
