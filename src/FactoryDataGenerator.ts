import Clues from 'clues';

export class FactoryDataGenerator<
    TSchema extends GeneratorSchema,
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
    protected clues = new Map<any, any>();
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
        const existingClue = this.clues.get(key);
        if (existingClue) {
            return existingClue;
        }
        
        const clue = Clues(this.output, key as string);
        this.clues.set(key, clue);
        
        return clue;
    }
    
    public async getOutput(): Promise<any> {
        const resolvedOutput: Record<any, any> = {
            ...this.output,
        };
        const entries: Array<Promise<any>> = Object.entries(this.output).map(
            async ([key, value]) => {
                if (value instanceof Promise) {
                    return [key, await value];
                }
                if (typeof value === 'function') {
                    return [key, await this.get(key)];
                }
                return [key, await this.output[key]];
            }
        )
        Object.assign(resolvedOutput, Object.fromEntries(await Promise.all(entries)));
        return resolvedOutput;
    }
}

export type DataGenerator<
    TSchema extends GeneratorSchema,
    TFactory extends GeneratorSchema = {},
> = {
    [key in keyof TSchema]: key extends keyof TFactory
                             ? GeneratorValue<TFactory[key], Resolver<TSchema>>
                             : GeneratorValue<TSchema[key], Resolver<TSchema>>
}

export type GeneratorSchema = Record<string, unknown>
export type ResolvedFactory<TFactory> = {
    [key in keyof TFactory]: TFactory[key] extends GeneratorValue<infer T> ? T : never
}
type GeneratorValue<
    SchemaValue,
    ThisType = unknown
> = SchemaValue | ((this: ThisType) => SchemaValue | Promise<SchemaValue>)