import { FactoryTemplate } from 'feathers-factory';
import { describe, expect, expectTypeOf, it } from 'vitest';


describe('Real-world examples', () => {
    describe('Invoice Template', () => {
        const template = new FactoryTemplate({
            items: () => [
                {
                    description: 'Test',
                    quantity: 1,
                    price: 10,
                },
            ],
            taxRate: 0.19,
            async subtotal() {
                const items = await this.get('items');
                return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
            },
            async tax() {
                return await this.get('subtotal') * await this.get('taxRate')
            },
            async total() {
                return await this.get('subtotal') + await this.get('tax')
            },
            async createdAt(){
              return new Date();
            }
        });
        
        it('calculates the correct subtotal', async () => {
            await expect(template.resolve()).resolves.toHaveProperty('subtotal', 10);
        });
        
        it('resolves the correct items type', async () => {
            const resolved = await template.resolve();
            expectTypeOf(resolved.items).toEqualTypeOf<{
                description: string;
                quantity: number;
                price: number;
            }[]>();
        })
        
        it.todo('can use nested functions to generate any number of line items');
    });
});