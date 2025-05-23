import type { Get, Paths } from 'type-fest';
import type { BaseSchema, ResolveSchemaOutput } from './Schema';

/**
 * Factory Template context.
 * Provides access to the current generation context.
 *
 * The `this` type within your template's generator functions.
 */
export abstract class SchemaContext<
    TSchema extends BaseSchema,
    TOutput extends ResolveSchemaOutput<TSchema> = ResolveSchemaOutput<TSchema>,
    TPaths extends string = Extract<Paths<TOutput>, string>,
> {
    public readonly _output!: TOutput;
    public readonly _paths!: TPaths;
    
    public get<TKey extends keyof TOutput>(key: TKey): Promise<TOutput[TKey]>
    public get<TKey extends TPaths>(key: TKey): Promise<Get<TOutput, TKey>>
    public get(key: TPaths | keyof TOutput): Promise<unknown> {
        // @ts-expect-error Todo: resolve type error
        return this._get(key);
    }
    
    public call<TKey extends Paths<TOutput> & string>(key: TKey): Promise<Get<TOutput, TKey>> {
        return this._call(key);
    }
    
    protected abstract _get(path: string): Promise<any>;
    protected abstract _call(path: string): Promise<any>;
}
