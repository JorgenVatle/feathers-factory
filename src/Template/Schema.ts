import type { Simplify } from 'type-fest';
import type { SchemaContext } from './Context';

/**
* Schema template.
* A map of all templating functions and fields that will run every time the
 * associated template or factory is executed.
 */
export type TemplateSchema<
    TSchema,
    TSchema2 = TSchema,
    TContext = SchemaContext<TSchema>,
> = & ExtendTemplateSchema<TSchema>
    & ThisType<TContext>
    & { [key in keyof TSchema2 as key extends keyof TSchema ? never : key]: SchemaField<TSchema2[key], TContext> };

type ExtendTemplateSchema<T> = {
    [K in keyof T]: T[K];
};

/**
 * Accepts a partial schema template to override base schema values.
* Used for template resolve() and extend() methods.
 */
export type SchemaOverrides<TSchema> = {
    [key in keyof TSchema]?: SchemaField<TSchema[key]>;
} & ThisType<SchemaContext<TSchema>>;


/**
 * Base type for template schemas.
 */
export type BaseSchema<TFields extends Record<string, unknown> = Record<string, unknown>> = TFields;

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
 * @example
 * type schema = {
 *     userId: () => 123,
 *     createdAt: () => new Date()
 * }
 *
 * const data: ResolveSchemaOutput<schema>
 *     // -> { userId: number, createdAt: Date }
 */
export type ResolveSchemaOutput<TSchema> = Simplify<{
    [key in keyof TSchema]: SchemaFieldValue<TSchema[key]>;
}>