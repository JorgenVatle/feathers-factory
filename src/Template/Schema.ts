import type { Simplify } from 'type-fest';
import type { SchemaContext } from './Context';

/**
* Schema template.
* A map of all templating functions and fields that will run every time the
 * associated template or factory is executed.
 */
export type TemplateSchema<
    /**
     * Expected output type for the template.
     */
    TSchema extends BaseSchema,
    /**
     * Mapped type of the context to expose to each field respectively.
     * We need to omit the return type of the current field to prevent
     * the compiler from squawking and deferring to 'unknown' for everything
     */
    TFieldContext extends Record<keyof TSchema, unknown> = {
        [key in keyof TSchema]: Simplify<Omit<TSchema, key>>
    },
> = {
    [key in keyof TSchema]: SchemaField<TSchema[key], TFieldContext[key]>
} & ThisType<SchemaContext<TSchema>>;

/**
 * Accepts a partial schema template to override base schema values.
* Used for template resolve() and extend() methods.
 */
export type TemplateSchemaOverrides<
    TSchema extends BaseSchema,
> = {
    [key in keyof TSchema]?: SchemaField<TSchema[key]>;
} & ThisType<SchemaContext<TSchema>>;


/**
 * Base type for template schemas.
 */
export type BaseSchema = Record<string, unknown>;

/**
 * Template factory function.
 * The function that runs every time the associated template or factory is
 * called
 */
export type TemplateFunction<
    TValue,
    TContext = BaseSchema
> = <TPeerContext extends NoInfer<TContext>,>(context: NoInfer<TPeerContext>) => TValue;

/**
 * Defines a value / template function that will execute every time the
 * associated template or factory is run.
 */
export type SchemaField<
    TValue,
    TContext = unknown,
    TResult = TValue | Promise<TValue>
> = TemplateFunction<TResult, TContext>;

/**
 * Unwrap any promises within the provided schema to enable dot notation
 * accessors for nested promisified fields.
 */
export type ResolveSchemaOutput<TSchema> = {
    [key in keyof TSchema]: TSchema[key] extends SchemaField<infer T> ? T : TSchema[key];
}