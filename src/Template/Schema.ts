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
    TFields extends {
        [key in keyof TSchema]: SchemaContext<Omit<TSchema, key>>
    } = {
        [key in keyof TSchema]: SchemaContext<Omit<TSchema, key>>
    }
> = {
    [key in keyof TSchema]: SchemaField<TSchema[key], TFields[key]>;
};

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
> = (...params: [context: TContext]) => TValue;

/**
 * Defines a value / template function that will execute every time the
 * associated template or factory is run.
 */
export type SchemaField<
    TValue,
    TSelf = unknown,
> = | ((...params: [context: TSelf]) => FieldValue<TValue>)
    | ((this: TSelf) => FieldValue<TValue>)
    | (() => FieldValue<TValue>)
    | (FieldValue<TValue>);

export type SchemaFieldValue<T> = T extends SchemaField<infer T> ? T : T;

type FieldValue<T> = Promise<T> | T;

/**
 * Unwrap any promises within the provided schema to enable dot notation
 * accessors for nested promisified fields.
 */
export type ResolveSchemaOutput<TSchema> = {
    [key in keyof TSchema]: SchemaFieldValue<TSchema[key]>;
}