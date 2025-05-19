import type { Simplify } from 'type-fest';


export function defineTemplateSchema<
    /**
     * The return type for each template function in the template.
     */
    TReturnType extends Record<keyof TFieldContext, unknown>,
    
    /**
     * Mapped type of the context to expose to each field respectively.
     * We need to omit the return type of the current field to prevent
     * the compiler from squawking and deferring to 'unknown' for everything
     */
    TFieldContext extends {
        [key in keyof TReturnType]: Simplify<Omit<TReturnType, key>>;
    },
>(template: {
    [key in keyof TReturnType | keyof TFieldContext]: (context: TFieldContext[key]) => TReturnType[key];
}) {
    return {};
}