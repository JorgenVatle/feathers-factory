export class FactoryTemplate<TTemplate> {
    constructor(protected readonly template: TTemplate) {}
    
    /**
     * Run all factory functions in the template and return final result to be
     * stored in the database.
     */
    public resolve(
        overrides: Partial<TTemplate & TemplateResult<TTemplate>>
    ): Promise<TemplateResult<TTemplate>> {
        // todo
        return {} as any;
    }
}

export type TemplateContext<TTemplate> = {
    [key in keyof TTemplate]: TemplateField<TTemplate[key]>;
}

/**
 * Factory Template field.
 * Specifies a function to run every time the factory is called. Or a static
 * value that will always remain the same.
 */
export type TemplateField<
    TValue = unknown,
> = TValue | (() => TValue | Promise<TValue>);

/**
 * Factory Template result.
 * The raw output of type of the template after resolving all fields.
 */
type TemplateResult<TTemplate> = {
    [key in keyof TTemplate]: TTemplate[key] extends TemplateField<infer T> ? T : never;
}

/**
 * Template overrides.
 * Defines the fields that can be overridden before resolving the final
 * template.
 */
type TemplateOverrides<TTemplate> = {
    [key in keyof TTemplate]?: TemplateField<TTemplate[key]>;
}