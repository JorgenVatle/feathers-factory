import { describe, expect, it } from 'vitest';
import App from '../feathers/App';
import { ArticleFactory, CommentOnOwnArticleFactory } from '../feathers/Factories';

describe('relational/cross-dependent factories', () => {
    it('creates user documents for articles', async () => {
        const article = await ArticleFactory.create();

        expect(article).toHaveProperty('userId');

        const user = await App.service('users').get(article.userId);

        expect(user).toHaveProperty('id', article.userId);
    });

    it('can create articles with comments from the author', async () => {
        const comment = await CommentOnOwnArticleFactory.create();
        const user = await App.service('users').get(comment.userId);
        const article = await App.service('articles').get(comment.articleId);

        expect(comment).toBeTruthy();
        expect(user).toHaveProperty('id', comment.userId);
        expect(article).toHaveProperty('id', comment.articleId);
    });
})