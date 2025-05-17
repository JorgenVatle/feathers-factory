import { TemplateContext } from './TemplateContext';

/**
 * Factory boilerplate template.
 * Defines the fields that will be generated when factories are called.
 */
export class FactoryTemplate<TTemplate> {
    constructor(public readonly _schema: TemplateSchema<TTemplate>) {}
    
    /**
     * Run all factory functions in the template and return final result to be
     * stored in the database.
     */
    public resolve(overrides?: TemplateOverrides<TTemplate>): Promise<InferOutput<TTemplate>> {
        const template = this.extend(overrides || {});
        const context = new TemplateContext(template);
        
        return context._resolveState();
    }
    
    public extend<TOverrides>(overrides: ExtendSchema<TTemplate, TOverrides>): ExtendTemplate<TTemplate, TOverrides> {
        // @ts-expect-error Incompatible types
        return new FactoryTemplate({
            ...this._schema,
            ...overrides,
        })
    }
}

/**
 * Factory Template definition.
 * Defines the fields that will be generated when the factory is called.
 */
export type TemplateSchema<TTemplate> = {
    [key in keyof TTemplate]: TemplateField<TTemplate[key]>;
} & ThisType<TemplateContext<TTemplate>>;


/**
 * Factory Template field.
 * Specifies a function to run every time the factory is called. Or a static
 * value that will always remain the same.
 */
type TemplateField<
    TValue = unknown,
> = TemplateValue<TValue> | TemplateFn<TValue>;

type TemplateFn<TValue> = <TSelf>(this: TSelf, context: TSelf) => TemplateValue<TValue>;
type TemplateValue<TValue> = TValue | Promise<TValue>;

/**
 * Unwraps {@link TemplateSchema} fields to their resulting output type.
 */
type UnwrapTemplateSchema<TTemplate> = {
    [key in keyof TTemplate]: InferFieldType<TTemplate[key]>;
}

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
 * Template overrides.
 * Defines the fields that can be overridden before resolving the final
 * template.
 */
export type TemplateOverrides<TTemplate> = {
    [key in keyof TTemplate]?: TemplateField<InferFieldType<TTemplate[key]>>;
} & ThisType<TemplateContext<TTemplate>>;

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
> = TOverrides & ThisType<TemplateContext<TMerged>>;