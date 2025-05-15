import { describe, expect, it } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';
import { TemplateContext } from './TemplateContext';

describe('TemplateContext', () => {
    
    it('can resolve static fields', () => {
        const context = new TemplateContext(
            new FactoryTemplate({
                staticField: 'ok',
            })
        )
        
        expect(context.get('staticField')).toEqual('ok');
    })
    
})