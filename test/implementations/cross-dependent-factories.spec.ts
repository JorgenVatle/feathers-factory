import Expect from 'expect';
import App from '../feathers/App';
import { ArticleFactory, CommentOnOwnArticleFactory } from '../feathers/Factories';

describe('relational/cross-dependent factories', () => {
    it('creates user documents for articles', async () => {
        const article = await ArticleFactory.create();

        Expect(article).toHaveProperty('userId');

        const user = await App.service('users').get(article.userId);

        Expect(user).toHaveProperty('id', article.userId);
    });

    it('can create articles with comments from the author', async () => {
        const comment = await CommentOnOwnArticleFactory.create();
        const user = await App.service('users').get(comment.userId);
        const article = await App.service('comments').get(comment.articleId);

        Expect(comment).toBeTruthy();
        Expect(user).toHaveProperty('id', comment.userId);
        Expect(article).toHaveProperty('id', comment.articleId);
    });
})