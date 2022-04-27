import Expect from 'expect';
import { ArticleFactory } from './Factories';

describe('Feathers Test Factories', () => {
    describe('ArticleFactory', () => {
        it('properly applies overrides defined as non-function properties', async () => {
            const article = await ArticleFactory.create({
                id: 'test',
            });

            Expect(article).toHaveProperty('id', 'test');
        });

        it('properly applies overrides defined as async functions', async () => {
            const article = await ArticleFactory.create({
                id: async () => 'async test',
            });

            Expect(article).toHaveProperty('id', 'async test');
        });
    });

});