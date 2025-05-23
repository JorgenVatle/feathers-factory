import type { Simplify } from 'type-fest';
import type { SchemaContext } from './Context';

export type TemplateFunction<
    TValue,
    TContext = unknown
> = <TPeerContext extends TContext,>(context: TPeerContext) => TValue;
export type BaseSchema = Record<string, unknown>;

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
    [key in keyof TSchema]: TemplateFunction<TSchema[key], TFieldContext[key]> | TSchema[key];
} & ThisType<SchemaContext<TSchema>>;