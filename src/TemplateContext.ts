import Clues from 'clues';
import type { FactoryTemplate } from './FactoryTemplate';

export class TemplateContext<TTemplate> {
    protected readonly state: ContextState<TTemplate>;
    
    constructor(protected readonly template: FactoryTemplate<TTemplate>) {
        this.state = Object.create(this);
        
        const entries = Object.entries(this.template._schema).map(([key, value]) => {
            return [key, this.wrapTemplateField(value)]
        })
        
        Object.assign(this.state, Object.fromEntries(entries));
    }
    
    protected wrapTemplateField(field: unknown) {
        if (!this.shouldWrap(field)) {
            return field;
        }
        return ['CONTEXT', function(this: unknown, CONTEXT: TemplateContext<TTemplate>) {
            return field.apply(this, [CONTEXT])
        }]
    }
    
    protected shouldWrap(field: unknown): field is Function {
        if (typeof field !== 'function') {
            return false;
        }
        if (Object.getOwnPropertyDescriptor(field, 'prototype')?.writable === false) {
            return false;
        }
        return true;
    }
    
    public get(key: keyof TTemplate) {
        return Clues(this.state, key as string, { CONTEXT: this });
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