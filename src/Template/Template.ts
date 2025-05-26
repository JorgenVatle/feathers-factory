import { type SchemaContext, TemplateContext } from './Context';
import type { BaseSchema, ResolveSchemaOutput, TemplateSchema, TemplateSchemaOverrides } from './Schema';


/**
 * Factory boilerplate template.
 * Defines the fields that will be generated when factories are called.
 */
export class FactoryTemplate<
    TSchema,
    TContext extends SchemaContext<TSchema> = SchemaContext<TSchema>
> {
    constructor(public readonly _schema: TemplateSchema<TSchema>) {
    }
    
    /**
     * Run all factory functions in the template and return final result to be
     * stored in the database.
     */
    public resolve(overrides?: TemplateSchemaOverrides<ResolveSchemaOutput<TSchema>>): Promise<ResolveSchemaOutput<TSchema>> {
        const template = this.extend(overrides || {});
        const context = new TemplateContext(template);
        
        return context._resolveState();
    }
    
    /**
     * Create a new factory template using the current template's schema as
     * defaults for the new template.
     */
    public extend<
        TOverrides extends BaseSchema,
    >(overrides: TemplateSchemaOverrides<Omit<TSchema, keyof TOverrides> & TOverrides>): FactoryTemplate<Omit<TSchema, keyof TOverrides> & TOverrides> {
        // @ts-expect-error Incompatible types
        return new FactoryTemplate({
            ...this._schema,
            ...overrides,
        });
    }
    
    /**
     * Retrieve a value from the template within a new templating context.
     */
    public get get(): NoInfer<TContext>['get'] {
        const context =  new TemplateContext(this.extend({}));
        // @ts-expect-error Type mismatch.
        return (key: any) => context.get(key);
    };
}