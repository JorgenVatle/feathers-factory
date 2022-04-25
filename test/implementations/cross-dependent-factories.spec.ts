import Expect from 'expect';
import App from '../feathers/App';
import { ArticleFactory } from '../feathers/Factories';

describe('relational/cross-dependent factories', () => {
    it('creates user documents for articles', async () => {
        const article = await ArticleFactory.create();

        Expect(article).toHaveProperty('userId');

        const user = await App.service('users').get(article.userId);

        Expect(user).toHaveProperty('_id', article.userId);
    })
})