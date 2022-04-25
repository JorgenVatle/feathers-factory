import Faker from '@faker-js/faker/dist/types';
import Factory from '../../src/Factory';
import App from './App';

const UsersService = App.service('users');
const ArticlesService = App.service('articles');

export const UserFactory = new Factory(UsersService, {
    _id: () => process.hrtime().join('-'),
    username: Faker.internet.userName,
})

export const ArticleFactory = new Factory(ArticlesService, async () => {
    const author = await UserFactory.create();
    return {
        _id: () => process.hrtime().join('-'),
        userId: () => author._id,
    }
});