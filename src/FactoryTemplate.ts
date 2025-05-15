export class FactoryTemplate<TTemplate> {
    constructor(protected readonly template: TemplateContext<TTemplate>) {}
    
    /**
     * Run all factory functions in the template and return final result to be
     * stored in the database.
     */
    public resolve(overrides?: TemplateOverrides<TTemplate>): Promise<TemplateResult<TTemplate>> {
        // todo
        return {} as any;
    }
}

export type TemplateContext<TTemplate> = {
    [key in keyof TTemplate]: TemplateField<TTemplate[key]>;
} & ThisType<{
    /**
     * Resolve the value of a template field within the current generator
     * context. Fields are only resolved once per generator context.
     *
     * This ensures that you can safely reference the same field multiple times
     * within the same generation context and from different fields.
     *
     * @example
     * template = ({
     *     firstName: () => faker.person.firstName(),
     *     lastName: () => faker.person.lastName(),
     *
     *     fullName: () => `${this.get('firstName')} ${this.get('lastName')}`,
     *     // -> John Doe
     *
     *     // Functions are only called once, then cached to ensure consistent
     *     // results within the same generation context.
     *     email: () => `${this.get('firstName')}.${this.get('lastName')}@example.com`
     *     // -> John.Doe@example.com,
     * })
     *
     */
    get<TField extends keyof TTemplate>(field: TField): Promise<InferFieldType<TTemplate[TField]>>;
    
    /**
     * Run the generator function for a given field. This will not cache the
     * result within the current context. Meaning you can call it multiple times
     * within the same generation context and it will always return a new value.
     *
     * This is useful if you want to extend the result of a field from within
     * another field. Do keep in mind that you might want to use it sparingly
     * in case the field has side-effects. E.g. creating new records in the
     * database.
     */
    call<TField extends keyof TTemplate>(field: TField): Promise<InferFieldType<TTemplate[TField]>>;
}>

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
    [key in keyof TTemplate]: InferFieldType<TTemplate[key]>;
}

/**
 * Template overrides.
 * Defines the fields that can be overridden before resolving the final
 * template.
 */
type TemplateOverrides<TTemplate> = {
    [key in keyof TTemplate]?: TemplateField<InferFieldType<TTemplate[key]>>;
}

/**
 * Infer the resolved output type of a given template field.
 */
type InferFieldType<T> = T extends TemplateField<infer T> ? T : never;