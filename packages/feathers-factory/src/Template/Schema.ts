import type { Simplify } from 'type-fest';
import type { SchemaContext } from './Context';

/**
* Schema template.
* A map of all templating functions and fields that will run every time the
 * associated template or factory is executed.
 */
export type TemplateSchema<
    TSchema,
    TContext = SchemaContext<TSchema>,
    TSchema2 = TSchema,
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
 * Extend an existing schema with new fields and optionally new types.
 * Unlike {@link SchemaOverrides}, this type will allow you to override types
 * from the base schema.
 */
export type ExtendSchema<
    TSchema,
    TOverrides,
> = TemplateSchema<
    Simplify<TOverrides & Partial<Omit<ResolveSchema<TSchema>, keyof TOverrides>>>,
    SchemaContext<TOverrides & Omit<TSchema, keyof TOverrides>>
>

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

type FieldValue<T> = Promise<T> | T;

/**
 * Unwrap any promises within the provided schema to enable dot notation
 * accessors for nested promisified fields.
 *
 * @warning This type helper is primarily for internal use. You're probably
 *      looking for InferOutput, which serves the same purpose with handlers for
 *      other input types.
 * @see {@link InferOutput} - Resolves both FactoryTemplate and SchemaTemplate
 *      types
 */
export type ResolveSchema<TSchema> = Simplify<{
    [key in keyof TSchema]: ResolveField<TSchema[key]>;
}>

/**
 * Resolve the output type of the provided schema field.
 * Unwraps any promises and function return types.
 *
 * @see {@link InferOutput} - Resolves both FactoryTemplate and SchemaTemplate
 *      types
 */
export type ResolveField<T> = T extends SchemaField<infer T> ? T : T;
