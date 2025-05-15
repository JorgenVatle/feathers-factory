import { describe, expect, it } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';
import { TemplateContext } from './TemplateContext';

describe('TemplateContext', () => {
    
    describe('basic usage', () => {
        const context = new TemplateContext(
            new FactoryTemplate({
                staticField: 'ok',
                arrowFunction: () => 'ok',
            })
        )
        
        it('can resolve static fields', () => {
            expect(context.get('staticField')).toEqual('ok');
        })
        
        it('can resolve arrow functions', () => {
            expect(context.get('arrowFunction')).toEqual('ok');
        })
    })
    
    
})