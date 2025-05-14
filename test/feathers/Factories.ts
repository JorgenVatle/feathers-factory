import { faker as Faker } from '@faker-js/faker';
import { Factory } from '../../src';
import App from './App';

const UsersService = App.service('users');
const ArticlesService = App.service('articles');
const CommentService = App.service('comments');
const AdapterService = App.service('adapter-service');

export const UserFactory = new Factory(UsersService, {
    id: () => process.hrtime().join('-'),
    username: Faker.internet.username,
})

export const ArticleFactory = new Factory(ArticlesService, {
    id: () => process.hrtime().join('-'),
    userId: async () => {
        const user = await UserFactory.create();
        return user.id;
    },
});

export const CommentOnOwnArticleFactory = new Factory(CommentService, {
    id: () => process.hrtime().join('-'),
    articleId: async () => {
        const article = await ArticleFactory.create();
        return article.id;
    },
    userId: async function() {
        const article = await ArticlesService.get(await this.get('articleId'));
        return article.userId;
    },
    content: Faker.lorem.paragraph,
});

export const AdapterFactory = new Factory(AdapterService, {
    id: () => process.hrtime().join('-'),
});
