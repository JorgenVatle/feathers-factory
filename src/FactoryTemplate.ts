export class FactoryTemplate<TTemplate> {
    constructor(protected readonly template: TTemplate) {}
}

export type TemplateContext<TTemplate> = {
    [key in keyof TTemplate]: TemplateField<TTemplate[key]>;
}

export type TemplateField<
    TValue = unknown,
> = TValue | (() => TValue | Promise<TValue>)