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
    public async resolve(overrides: object = {}): Promise<ResolvedFactory<TSchema>> {
        const data = this.merge(overrides);
        const resolver = new Resolver(data);
        
        const dataResolvers = Object.keys(data).map(async (key: string) => {
            await resolver.get(key);
        });
        
        await Promise.all(dataResolvers);
        
        return resolver.getOutput();
    }
}

class Resolver<TFactory extends Record<string, any>> {
    protected output: Record<any, any>;
    constructor(protected readonly factory: TFactory) {
        this.output = {
            ...factory,
        };
        
        Object.entries(this.output).map(([key, value]) => {
            if (typeof value === 'function') {
                this.output[key] = value.bind(this);
            }
        })
    }
    
    public get<TKey extends keyof TFactory>(key: TKey): Promise<ResolvedFactory<TFactory>[TKey]> {
        return Object.assign(
            this.output[key],
            Clues(this.output, key as string)
        );
    }
    
    public async getOutput(): Promise<any> {
        const resolvedOutput: Record<any, any> = {
            ...this.output,
        };
        const entries: Array<Promise<any>> = Object.entries(this.output).map(
            async ([key, value]) => {
                if (typeof value === 'function') {
                    return [key, await this.get(key)];
                }
                return [key, this.output[key]];
            }
        )
        Object.assign(resolvedOutput, await Promise.all(entries));
        return resolvedOutput;
    }
}

export type DataGenerator<
    TSchema,
    TFactory extends Record<string, unknown> = {},
> = {
    [key in keyof TFactory]: key extends keyof TSchema
                             ? GeneratorValue<TSchema[key], Resolver<TFactory>>
                             : GeneratorValue<TFactory[key], Resolver<TFactory>>
}
export type ResolvedFactory<TFactory> = {
    [key in keyof TFactory]: TFactory[key] extends GeneratorValue<infer T> ? T : never
}
type GeneratorValue<
    SchemaValue,
    ThisType = unknown
> = SchemaValue | ((this: ThisType) => SchemaValue | Promise<SchemaValue>)