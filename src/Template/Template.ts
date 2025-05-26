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
    
    public extend<
        TOverrides extends BaseSchema,
    >(overrides: TemplateSchemaOverrides<Omit<TSchema, keyof TOverrides> & TOverrides>): FactoryTemplate<Omit<TSchema, keyof TOverrides> & TOverrides> {
        // @ts-expect-error Incompatible types
        return new FactoryTemplate({
            ...this._schema,
            ...overrides,
        });
    }
    
    declare get: NoInfer<TContext>['get'];
}