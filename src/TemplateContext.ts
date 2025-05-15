import type { FactoryTemplate } from './FactoryTemplate';

export class TemplateContext<TTemplate> {
    protected readonly state: ContextState<TTemplate>;
    
    constructor(protected readonly template: FactoryTemplate<TTemplate>) {
        this.state = Object.create(template);
    }
    
    public get(key: keyof TTemplate) {
        // todo
    }
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