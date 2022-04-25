import Faker from '@faker-js/faker';
import Factory from '../../src/Factory';
import App from './App';

const UsersService = App.service('users');
const ArticlesService = App.service('articles');
const CommentService = App.service('comments');

export const UserFactory = new Factory(UsersService, {
    id: () => process.hrtime().join('-'),
    username: Faker.internet.userName,
})

export const ArticleFactory = new Factory(ArticlesService, {
    id: () => process.hrtime().join('-'),
    userId: async () => {
        const user = await UserFactory.create();
        return user.id;
    },
});

export const StrictArticleFactory = new Factory<{ userId: string, content: string }>(ArticlesService, {
    userId: () => 'some-string',
    content: () => 'foobar',
});

export const CommentOnOwnArticleFactory = new Factory<{
    userId: string;
    articleId: string;
    content: string;
}>(CommentService, {
    articleId: async () => {
        const article = await ArticleFactory.create();
        return article.id;
    },
    userId: async function() {
        const user = UsersService.get(this.articleId);
        return user.id;
    },
    content: Faker.lorem.paragraph,
});
