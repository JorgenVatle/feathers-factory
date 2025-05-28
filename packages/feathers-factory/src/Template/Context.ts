import Clues from 'clues';
import type { Get, Paths } from 'type-fest';
import { FieldResolveError } from '../Errors';
import type { ResolveField, ResolveSchema } from './Schema';
import { FactoryTemplate } from './Template';

/**
 * Factory Template context.
 * Provides access to the current generation context.
 *
 * The `this` type within your template's generator functions.
 */
export abstract class SchemaContext<
    TSchema,
    TOutput = ResolveSchema<TSchema>,
> {
    /**
     * Resolve the value of a template field within the current generator
     * context. Fields are only resolved once per generator context.
     *
     * This ensures that you can safely reference the same field multiple times
     * within the same generation context and from different fields and always
     * get the same value.
     *
     * In other words, template functions will only run once regardless of how
     * many times you call {@link TemplateContext.get}.
     *
     * If you do want a new value, use {@link TemplateContext.call} instead.
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
     */
    public get<TKey extends keyof TOutput>(key: TKey): Promise<ResolveField<TOutput[TKey]>>
    public get<TKey extends Paths<TOutput> & string>(key: TKey): Promise<Get<TOutput, TKey>>
    public get<TKey extends any>(key: TKey): Promise<unknown> {
        // @ts-expect-error Todo: resolve type error
        return this._get(key);
    }
    
    /**
     * Run the generator function for a given field. This will not cache the
     * result within the current context. Meaning you can call it multiple times
     * within the same generation context and it will always return a new value.
     *
     * This is useful if you want to extend the result of a field from within
     * another field. Do keep in mind that you might want to use it sparingly
     * in case the field has side-effects. E.g. creating new records in the
     * database.
     *
     * @example
     * new FactoryTemplate({
     *     firstName: () => faker.person.firstName(),
     *     lastName: () => faker.person.lastName(),
     *
     *     fullName: () => `${this.get('firstName')} ${this.get('lastName')}`,
     *     // -> John Doe
     *
     *     family: () => [
     *         this.call('fullName'), // -> <New random name>
     *         this.call('fullName'), // -> <New random name>
     *
     *         this.get('fullName'), // -> John Doe
     *     ]
     * })
     */
    public call<TKey extends Paths<TOutput> & string>(key: TKey): Promise<Get<TOutput, TKey>> {
        return this._call(key);
    }
    
    /**
     * Resolve the value of a field within the current context. Ensures the
     * value will be cached in the current context. So functions will only run
     * once.
     */
    protected abstract _get(path: string): Promise<any>;
    
    /**
     * Resolve a template property in a new context. Ensures a new value will
     * be provided every time.
     */
    protected abstract _call(path: string): Promise<any>;
}

/**
 * Factory Template context.
 * Provides access to the current generation context.
 *
 * The `this` type within your template's generator functions.
 */
export class TemplateContext<TSchema> extends SchemaContext<TSchema> {
    /**
     * Internal state for the getter machine.
     * The structure of this field can be unexpected unless explicitly accessed
     * through the {@link TemplateContext.get} method.
     * @private
     */
    public readonly _state: ContextState;
    
    constructor(protected readonly template: FactoryTemplate<TSchema>) {
        super();
        this._state = Object.create(this);
        
        const entries = Object.entries(this.template._schema).map(([key, value]) => {
            return [key, this.wrapTemplateField(value)];
        });
        
        Object.assign(this._state, Object.fromEntries(entries));
    }
    
    /**
     * Wrap any template functions around an array to indicate to Clues.js
     * what parameters are expected. Which is just this class instance.
     *
     * Enables use of the context parameter in arrow functions.
     */
    protected wrapTemplateField(field: unknown) {
        if (!this.shouldWrap(field)) {
            return field;
        }
        return [
            'CONTEXT', function(this: unknown, CONTEXT: TemplateContext<TSchema>) {
                return field.apply(this, [CONTEXT]);
            },
        ];
    }
    
    /**
     * Check whether the provided field is a function we should wrap to help
     * Clues.js resolve input types.
     */
    protected shouldWrap(field: unknown): field is Function {
        if (typeof field !== 'function') {
            return false;
        }
        if (Object.getOwnPropertyDescriptor(field, 'prototype')?.writable === false) {
            return false;
        }
        return true;
    }
    
    /**
     * Attempt to resolve the current context state.
     * Used primarily for testing. The internal state does change during
     * resolve and could yield unexpected results.
     * @private
     */
    public async _resolveState() {
        const result = Object.keys(this._state).map(async (key) => {
            return [key, await this.get(key as any)];
        });
        return Object.fromEntries(await Promise.all(result));
    };
    
    /**
     * Retrieve and memoize the result of the given property path.
     * Calls any functions and caches the output for any subsequent calls.
     */
    protected async _get(key: string): Promise<unknown> {
        try {
            return await Clues(this._state, key as string, { CONTEXT: this });
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            const descriptors = Object.getOwnPropertyDescriptors(error);
            let message = 'Unknown error';
            if ('message' in descriptors) {
                message = descriptors.message.value;
            }
            throw new FieldResolveError(
                `Failed to resolve '${key}' field: ${message}`,
                { key, context: this },
                { cause: error }
            )
        }
    }
    
    /**
     * Disregard field memoization and always call any functions associated
     * with the provided property path.
     */
    public _call(key: string) {
        const freshContext = new TemplateContext(this.template);
        
        return freshContext._get(key);
    }
}

/**
 * Resolver state. May contain some partially resolved template fields.
 */
type ContextState = Record<string, ContextField>;

/**
 * Contextualized FactoryTemplate fields.
 * When resolving some fields will get converted to promises,
 * some immediately to their resulting value, etc.
 *
 * Todo: Attempt to infer types that will never get converted to a promise or
 *  function. (sync functions, static values, etc.)
 */
type ContextField<TType = unknown> =
    | TType
    | Promise<TType>
    | (() => Promise<TType> | TType);