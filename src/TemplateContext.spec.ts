import { describe, expect, it } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';
import { TemplateContext } from './TemplateContext';

describe('TemplateContext', () => {
    
    describe('Basic field resolving', () => {
        const context = new TemplateContext(
            new FactoryTemplate({
                staticField: 'ok',
                arrowFunction: () => 'ok',
            })
        )
        
        it('can resolve static fields', async () => {
            expect(await context.get('staticField')).toEqual('ok');
        })
        
        it('can resolve arrow functions', async () => {
            expect(await context.get('arrowFunction')).toEqual('ok');
        })
    })
    
    
})