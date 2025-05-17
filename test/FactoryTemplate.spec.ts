import { describe, expect, it } from 'vitest';
import { FactoryTemplate } from '../src';


describe('Real-world examples', () => {
    describe('Invoice Template', () => {
        const template = new FactoryTemplate({
            items: () => [
                {
                    description: 'Test',
                    quantity: 1,
                    price: 10
                },
            ],
            taxRate: 0.19,
            async subtotal() {
                const items = await this.get('items');
                return items.reduce((acc, item) => acc + item.quantity * item.price, 0)
            },
            tax: async (ctx) => await ctx.get('subtotal') * await ctx.get('taxRate'),
            total: (ctx) => await ctx.get('subtotal') + await ctx.get('tax'),
            createdAt: () => new Date(),
        });
        
        it('calculates the correct subtotal', async () => {
            await expect(template.resolve()).resolves.toHaveProperty('subtotal', 10);
        });
        
        it.todo('can use nested functions to generate any number of line items');
    })
})