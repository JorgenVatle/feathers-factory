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
    public resolve(overrides?: TemplateOverrides<TTemplate>): Promise<TemplateResult<TTemplate>> {
        const template = this.extend(overrides || {});
        const context = new TemplateContext(template);
        
        return context._resolveState();
    }
    
    public extend<TOverrides>(overrides: ExtendedTemplateSchema<TTemplate, TOverrides>): ExtendedFactoryTemplate<TTemplate, TOverrides> {
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
    [key in keyof TTemplate]: TemplateField<TTemplate[key], TTemplate>;
} & ThisType<TemplateContext<TTemplate>>


/**
 * Factory Template field.
 * Specifies a function to run every time the factory is called. Or a static
 * value that will always remain the same.
 */
type TemplateField<
    TValue = unknown,
    TTemplate = unknown,
> = TValue | ((context: TemplateContext<TTemplate>) => TValue | Promise<TValue>);

/**
 * Factory Template result.
 * The raw output of type of the template after resolving all fields.
 */
export type TemplateResult<TTemplate> = {
    [key in keyof TTemplate]: InferFieldType<TTemplate[key]>;
}

/**
 * Template overrides.
 * Defines the fields that can be overridden before resolving the final
 * template.
 */
export type TemplateOverrides<TTemplate> = {
    [key in keyof TTemplate]?: TemplateField<InferFieldType<TTemplate[key]>, TTemplate>;
} & ThisType<TemplateContext<TTemplate>>;

/**
 * Infer the resolved output type of a given template field.
 */
export type InferFieldType<T> = T extends TemplateField<infer T> ? T : never;

/**
 * Merge two template definitions to create a new template using one as a base.
 */
type ExtendedFactoryTemplate<
    TTemplate,
    TOverrides,
    TResult = TTemplate & TOverrides,
    TMerged = {
        [key in keyof TResult]: key extends keyof TOverrides
                                ? TOverrides[key]
                                : TResult[key];
    }
> = FactoryTemplate<TMerged>;

type ExtendedTemplateSchema<
    TTemplate,
    TOverrides,
    TResult = TTemplate & TOverrides,
    TMerged = {
        [key in keyof TResult]: key extends keyof TOverrides
                                ? TOverrides[key]
                                : TResult[key];
    }
> = TOverrides & ThisType<TemplateContext<TMerged>>;