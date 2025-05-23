import type { Get, Paths } from 'type-fest';
import type { BaseSchema, ResolveSchemaOutput } from './Schema';

/**
 * Factory Template context.
 * Provides access to the current generation context.
 *
 * The `this` type within your template's generator functions.
 */
export abstract class SchemaContext<TSchema extends BaseSchema, TOutput = ResolveSchemaOutput<TSchema>> {
    public get<TKey extends Paths<TOutput> & string>(key: TKey): Promise<Get<TOutput, TKey>> {
        return this._get(key);
    }
    
    public call<TKey extends Paths<TOutput> & string>(key: TKey): Promise<Get<TOutput, TKey>> {
        return this._call(key);
    }
    
    protected abstract _get(path: string): Promise<any>;
    protected abstract _call(path: string): Promise<any>;
}
