import { type SchemaContext, TemplateContext } from './Context';
import type { BaseSchema, ResolveSchemaOutput, TemplateSchema, TemplateSchemaOverrides } from './Schema';


/**
 * Factory boilerplate template.
 * Defines the fields that will be generated when factories are called.
 */
export class FactoryTemplate<
    TSchema,
    TContext extends SchemaContext<TSchema> = SchemaContext<TSchema>,
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
     *
     * Calls functions, if any, and yields the result of the provided field.
     * For non-function fields, it will be the static value or awaited promise
     * specified in the template.
     *
     * @warning You are probably looking for {@link resolve}.
     * This will yield a new value every time it's called. If the field also
     * references sibling fields within the template, they will also be called
     * every time you run this method.
     *
     * @example
     * const template = new FactoryTemplate({
     *     order: () => OrderFactory.create(),
     *     shopId: (ctx) => ctx.get('order.shop._id'),
     * });
     *
     * // This will be unrelated to the shop ID in `order`.
     * const order = template.resolveField('order');
     * const shopId = template.resolveField('shopId');
     *
     * order.shop._id === shopId
     * // -> false
     *
     * // Use resolve() instead. This ensures that peer fields are contextual.
     * const { order, shopId } = template.resolve();
     *
     * shopId === order.shop._id;
     * // -> true
     */
    public get resolveField(): NoInfer<TContext>['call'] {
        const context =  new TemplateContext(this.extend({}));
        // @ts-expect-error Type mismatch.
        return (key: any) => context.get(key);
    };
}

/**
 * Unwrap a factory template to resolve the final output type.
 */
export type InferOutput<T> =
    T extends FactoryTemplate<infer TOutput>
    ? ResolveSchemaOutput<TOutput>
    : ResolveSchemaOutput<T>;