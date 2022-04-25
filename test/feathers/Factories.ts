import Faker from '@faker-js/faker';
import Factory from '../../src/Factory';
import App from './App';

const UsersService = App.service('users');
const ArticlesService = App.service('articles');

export const UserFactory = new Factory(UsersService, {
    id: () => process.hrtime().join('-'),
    username: Faker.internet.userName,
})

export const ArticleFactory = new Factory(ArticlesService, {
    id: () => process.hrtime().join('-'),
    userId: async () => {
        const user = await UserFactory.create();
        return user.id;
    }
});