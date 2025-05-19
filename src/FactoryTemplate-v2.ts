import type { Simplify } from 'type-fest';


export function defineTemplateSchema<
    TReturnType extends Record<keyof TOutputType, unknown>,
    TOutputType extends {
        [key in keyof TReturnType]: Simplify<Omit<TReturnType, key>>;
    },
>(template: {
    [key in keyof TReturnType | keyof TOutputType]: (context: TOutputType[key]) => TReturnType[key];
}) {
    return {};
}