export class FactoryTemplate<TTemplate> {
    constructor(protected readonly template: TTemplate) {}
    
    public resolve(): Promise<TemplateResult<TTemplate>> {
        // todo
        return {} as any;
    }
}

export type TemplateContext<TTemplate> = {
    [key in keyof TTemplate]: TemplateField<TTemplate[key]>;
}

export type TemplateField<
    TValue = unknown,
> = TValue | (() => TValue | Promise<TValue>);

type TemplateResult<TTemplate> = {
    [key in keyof TTemplate]: TTemplate[key] extends TemplateField<infer T> ? T : never;
}