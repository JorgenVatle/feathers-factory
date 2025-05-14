import Clues from 'clues';

export class FactoryDataGenerator<
    TProps extends Record<string, unknown>,
    TFactory extends Record<string, unknown> = {},
> {
    constructor(
        protected readonly props: FactoryDataGenerator<TProps, TFactory>
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
    public async resolve(overrides: object): Promise<ResolvedFactory<TProps>> {
        const output: { [s: string]: any } = {};
        const data = this.merge(overrides);
        
        const dataResolvers = Object.keys(data).map(async (key: string) => {
            output[key] = await Clues(data, key);
        });
        
        await Promise.all(dataResolvers);
        
        return output as any;
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