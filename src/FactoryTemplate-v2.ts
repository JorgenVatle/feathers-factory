import type { Get, Paths, Simplify } from 'type-fest';


export function defineTemplateSchema<
    /**
     * The return type for each template function within the template.
     */
    const TReturnType extends Record<TSchemaKeys, unknown>,
    /**
     * Mapped type of the context to expose to each field respectively.
     * We need to omit the return type of the current field to prevent
     * the compiler from squawking and deferring to 'unknown' for everything
     */
    const TFieldContext extends {
        [key in TSchemaKeys]: Simplify<Omit<TReturnType, key>>;
    },
    const TTemplate extends {
        [key in TSchemaKeys]: TemplateFunction<TReturnType[key], TFieldContext[key]>;
    },
    const TSchemaKeys extends keyof TReturnType | keyof TFieldContext,
>(template: {
    [key in TSchemaKeys]: TemplateFunction<TReturnType[key], TFieldContext[key]>;
}): TTemplate {
    return template as any;
}

export type TemplateFunction<
    TValue,
    TContext = unknown
> = <TPeerContext extends TContext,>(context: TPeerContext) => TValue;

export type TemplateSchema<
    /**
     * Expected output type for the template.
     */
    TSchema extends Record<string, unknown>,
    /**
     * Mapped type of the context to expose to each field respectively.
     * We need to omit the return type of the current field to prevent
     * the compiler from squawking and deferring to 'unknown' for everything
     */
    TFieldContext extends Record<keyof TSchema, unknown> = {
        [key in keyof TSchema]: Simplify<Omit<TSchema, key>>
    },
> = {
    [key in keyof TSchema]: TemplateFunction<TSchema[key], TFieldContext[key]> | TSchema[key];
} & ThisType<SchemaContext<TSchema>>;

/**
 * Unwrap any promises within the provided schema to enable dot notation
 * accessors for nested promisified fields.
 */
type ResolveSchemaOutput<TSchema> = {
    [key in keyof TSchema]: TSchema[key] extends Promise<infer T> ? T : TSchema[key];
}

type SchemaContext<TSchema, TOutput = ResolveSchemaOutput<TSchema>> = {
    get<TKey extends Paths<TOutput> & string>(key: TKey): Get<TOutput, TKey>
}

export class FactoryTemplateV2<
    TSchema extends Record<string, unknown>,
> implements SchemaContext<TSchema> {
    constructor(public readonly _schema: TemplateSchema<TSchema, {
        [key in keyof TSchema]: SchemaContext<Simplify<Omit<TSchema, key>>>
    }>) {}
    
    declare get: SchemaContext<TSchema>['get'];
}