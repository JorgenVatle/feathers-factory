import Clues from 'clues';

export class FactoryDataGenerator<
    TSchema,
    TFactory extends Record<string, unknown>,
> {
    constructor(
        protected readonly props: DataGenerator<TSchema, TFactory>
    ) {}
    
    protected merge(overrides: object) {
        return {
            ...this.props,
            ...overrides,
        }
    }
    
    /**
     * Apply overrides to base props and resolve the outcome of the factory
     * @param overrides
     */
    public async resolve(overrides: object): Promise<ResolvedFactory<TSchema>> {
        const data = this.merge(overrides);
        const resolver = new Resolver(data);
        
        const dataResolvers = Object.keys(data).map(async (key: string) => {
            await resolver.get(key);
        });
        
        await Promise.all(dataResolvers);
        
        return resolver.output as any;
    }
}

class Resolver<TFactory extends Record<string, any>> {
    public readonly output: TFactory;
    constructor(protected readonly factory: TFactory) {
        this.output = {
            ...factory,
        };
    }
    
    public async get<TKey extends keyof TFactory>(key: TKey): Promise<ResolvedFactory<TFactory>[TKey]> {
        return Object.assign(this.output[key], await Clues(this.output, key as string));
    }
}

export type DataGenerator<
    TSchema,
    TFactory extends Record<string, unknown> = {},
    TResolvedFactory = ResolvedFactory<TFactory>,
> = {
    [key in keyof TFactory]: key extends keyof TSchema
                             ? GeneratorValue<TSchema[key], TResolvedFactory>
                             : GeneratorValue<TFactory[key], TResolvedFactory>
}
export type ResolvedFactory<TFactory> = {
    [key in keyof TFactory]: TFactory[key] extends GeneratorValue<infer T> ? T : never
}
type GeneratorValue<
    SchemaValue,
    ThisType = unknown
> = SchemaValue | ((this: ThisType) => SchemaValue | Promise<SchemaValue>)