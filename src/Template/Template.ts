import type { Simplify } from 'type-fest';
import { type SchemaContext, TemplateContext } from './Context';
import type {
    BaseSchema,
    ResolveSchemaOutput,
    TemplateFunction,
    TemplateSchema,
    TemplateSchemaOverrides,
} from './Schema';


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
    TSchema extends BaseSchema,
    TContext extends SchemaContext<TSchema> = SchemaContext<TSchema>,
> {
    constructor(
        public readonly _schema: TemplateSchema<TSchema>,
        public readonly scheme?: TSchema,
    ) {}
    
    declare get: NoInfer<TContext>['get'];
}

/**
 * Factory boilerplate template.
 * Defines the fields that will be generated when factories are called.
 */
export class FactoryTemplate<
    TSchema,
> {
    constructor(public readonly _schema: TemplateSchema<TSchema>) {
    }
    
    /**
     * Run all factory functions in the template and return final result to be
     * stored in the database.
     */
    public resolve(overrides?: TemplateSchemaOverrides<TSchema>): Promise<ResolveSchemaOutput<TSchema>> {
        const template = this.extend(overrides || {});
        const context = new TemplateContext(template);
        
        return context._resolveState();
    }
    
    public extend<
        TOverrides extends BaseSchema,
    >(overrides: TemplateSchemaOverrides<TSchema & TOverrides>): FactoryTemplate<TSchema & TOverrides> {
        // @ts-expect-error Incompatible types
        return new FactoryTemplate({
            ...this._schema,
            ...overrides,
        });
    }
}

/**
 * Factory Template field.
 * Specifies a function to run every time the factory is called. Or a static
 * value that will always remain the same.
 */
type TemplateField<
    TValue = unknown,
> = TemplateValue<TValue> | TemplateFn<TValue>;
type TemplateFn<TValue> = () => TemplateValue<TValue>;
type TemplateValue<TValue> = TValue | Promise<TValue>;
/**
 * Unwraps {@link TemplateSchema} fields to their resulting output type.
 */
type UnwrapTemplateSchema<TTemplate> = Simplify<{
    [key in keyof TTemplate]: InferFieldType<TTemplate[key]>;
}>
/**
 * Infer the resulting data type of the provided factory template.
 * @example
 * const userTemplate = new FactoryTemplate({
 *     userId: () => 123,
 *     createdAt: () => new Date()
 * })
 *
 * const data: InferOutput<typeof userTemplate>
 *     // -> { userId: number, createdAt: Date }
 */
export type InferOutput<TTemplate> =
    UnwrapTemplateSchema<
        TTemplate extends FactoryTemplate<infer T>
        ? T
        : TTemplate
    >;
/**
 * Infer the resolved output type of a given template field.
 */
export type InferFieldType<T> = T extends TemplateField<infer R> ? R : never;
/**
 * Merge two template definitions to create a new template using one as a base.
 */
export type ExtendTemplate<
    TTemplate,
    TOverrides,
    TResult = TTemplate & TOverrides,
    TMerged = {
        [key in keyof TResult]: key extends keyof TOverrides
                                ? TOverrides[key]
                                : TResult[key];
    }
> = FactoryTemplate<TMerged>;
/**
 * Combine a target schema with a baseline schema.
 */
export type ExtendSchema<
    TTemplate,
    TOverrides,
    TResult = TTemplate & TOverrides,
    TMerged = {
        [key in keyof TResult]: key extends keyof TOverrides
                                ? TOverrides[key]
                                : TResult[key];
    }
> = TemplateOverrides<TMerged>;