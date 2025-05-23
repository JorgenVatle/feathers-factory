import type { Simplify } from 'type-fest';


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
    const TSchemaKeys extends keyof TReturnType | keyof TFieldContext,
>(template: {
    [key in TSchemaKeys]: TemplateFunction<TReturnType[key], TFieldContext[key]>;
}) {
    return template;
}

type TemplateFunction<
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
    [key in keyof TSchema]: (context: SchemaContext<TFieldContext[key]>) => TSchema[key];
}

type SchemaContext<TFields> = {
    get<TKey extends keyof TFields>(key: TKey): TFields[TKey];
}

export class FactoryTemplateV2<
    TSchema extends Record<string, unknown>,
> {
    constructor(public readonly _schema: TemplateSchema<TSchema>) {
    }
    
    public get<TKey extends keyof TSchema>(key: TKey): TSchema[TKey] {
        return {} as any; // todo
    }
}