import type { Simplify } from 'type-fest';
import type { SchemaContext } from './Context';
import type { SchemaField, TemplateFunction } from './Schema';


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

export class FactoryTemplateV2<
    const TKeys extends keyof TSchema,
    const TSchema extends Record<TKeys, unknown>,
    const TContext extends SchemaContext<TSchema> = SchemaContext<TSchema>,
> {
    constructor(
        public readonly _schema: {
            [key in TKeys]: SchemaField<TSchema[key], TContext>
        } & ThisType<TContext>,
        public readonly scheme?: TSchema,
    ) {}
    
    declare get: NoInfer<TContext>['get'];
}