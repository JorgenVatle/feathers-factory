import Clues from 'clues';
import type { Get, Paths } from 'type-fest';
import type { FactoryTemplate } from './FactoryTemplate';

/**
 * Factory Template context.
 * Provides access to the current generation context.
 *
 * The `this` type within your template's generator functions.
 */
export class TemplateContext<TTemplate> {
    /**
     * Internal state for the getter machine.
     * The structure of this field can be unexpected unless explicitly accessed
     * through the {@link TemplateContext.get} method.
     * @private
     */
    public readonly _state: ContextState<TTemplate>;
    
    constructor(protected readonly template: FactoryTemplate<TTemplate>) {
        this._state = Object.create(this);
        
        const entries = Object.entries(this.template._schema).map(([key, value]) => {
            return [key, this.wrapTemplateField(value)]
        })
        
        Object.assign(this._state, Object.fromEntries(entries));
    }
    
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
    public get<
        TKey extends Paths<TTemplate> & string,
    >(key: TKey): GetTemplateField<TTemplate, TKey> {
        return Clues(this._state, key as string, { CONTEXT: this });
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
     * template = ({
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
     */
    public call<
        TKey extends Paths<TTemplate> & string
    >(key: TKey): GetTemplateField<TTemplate, TKey> {
        const freshContext = new TemplateContext(this.template);
        
        return freshContext.get(key);
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
        return ['CONTEXT', function(this: unknown, CONTEXT: TemplateContext<TTemplate>) {
            return field.apply(this, [CONTEXT])
        }]
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
            return [key, await this.get(key as any)]
        });
        return Object.fromEntries(await Promise.all(result));
    };
}

/**
 * Resolver state. May contain some partially resolved template fields.
 */
type ContextState<TTemplate> = {
    [key in keyof TTemplate]: ContextField<TTemplate[key]>;
}

/**
 * Contextualized FactoryTemplate fields.
 * When resolving some fields will get converted to promises,
 * some immediately to their resulting value, etc.
 *
 * Todo: Attempt to infer types that will never get converted to a promise or
 *  function. (sync functions, static values, etc.)
 */
type ContextField<TType> =
    | TType
    | Promise<TType>
    | (() => Promise<TType> | TType);

/**
 * After resolving a field, it'll either be it's final type or a promise
 * in cases where there's peer dependencies or the field function actually
 * is async.
 */
type ContextFieldOutcome<TType> =
    TType extends ContextField<infer T>
    ? Promise<T> | T
    : never;

type GetTemplateField<
    TTemplate,
    TKey extends string,
> = Promise<Get<TTemplate, TKey> extends (...args: any) => infer T
    ? T
    : TKey extends keyof TTemplate
      ? TTemplate[TKey]
      : never>