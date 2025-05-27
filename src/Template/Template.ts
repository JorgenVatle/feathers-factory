import type { Simplify } from 'type-fest';
import { type SchemaContext, TemplateContext } from './Context';
import type { BaseSchema, ResolveSchema, SchemaOverrides, TemplateSchema } from './Schema';


export class FactoryTemplate<
    TSchema,
    TContext extends SchemaContext<TSchema> = SchemaContext<TSchema>,
> {
    public readonly _schema: TemplateSchema<TSchema>;
    
    /**
     * Factory data template.
     * Defines a set of static values or functions that can be run to produce new
     * data every time the template is resolved. Normally by the Factory class.
     *
     * Each template resolve request is contextualized so that the fields in your
     * template always receive the same value if they depend on the result of
     * sibling fields.
     *
     * Factory Templates has nothing to do with Feathers.js and you're free to use
     * them anywhere there is a use for running a set of functions that depend on
     * output of sibling fields within the same context.
     *
     * @param schema Template schema - Can be functions or static values. All
     *      functions will be replaced with their return types when
     *      resolving the template
     */
    constructor(schema: TemplateSchema<TSchema>) {
        this._schema = schema;
    }
    
    /**
     * Run all factory functions in the template within a new template context.
     *
     * This ensures that fields within the template that depend on each other
     * (through e.g {@link SchemaContext.get}) will only execute once.
     *
     * In other words, functions are guaranteed to run only once with each
     * call to {@link resolve}.
     */
    public resolve(overrides?: SchemaOverrides<ResolveSchema<TSchema>>): Promise<ResolveSchema<TSchema>> {
        const template = this.extend(overrides || {});
        const context = new TemplateContext(template);
        
        return context._resolveState();
    }
    
    /**
     * Create a new factory template using the current template's schema as
     * defaults for the new template.
     */
    public extend<TOverrides extends BaseSchema>(
        overrides: SchemaOverrides<Simplify<Omit<TSchema, keyof TOverrides> & TOverrides>>
    ): FactoryTemplate<Simplify<Omit<TSchema, keyof TOverrides> & TOverrides>> {
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
    ? ResolveSchema<TOutput>
    : ResolveSchema<T>;