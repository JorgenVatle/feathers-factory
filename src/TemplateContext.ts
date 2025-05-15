import type { FactoryTemplate } from './FactoryTemplate';

class TemplateContext<TTemplate> {
    protected readonly result: object;
    
    constructor(protected readonly template: FactoryTemplate<TTemplate>) {
        this.result = Object.create(template);
    }
    
    public resolve() {
        // todo
    }
}