# Feathers Factory
A dead easy way to mock data for testing your [Feathers](https://feathersjs.com/) services. Heavily inspired by 
[Meteor Factory](https://github.com/versolearning/meteor-factory)

[![Downloads](https://img.shields.io/npm/dt/feathers-factory.svg)](https://www.npmjs.com/package/feathers-factory)
[![Version](https://img.shields.io/npm/v/feathers-factory.svg)](https://www.npmjs.com/package/feathers-factory)
[![CircleCI](https://circleci.com/gh/JorgenVatle/feathers-factory.svg?style=svg)](https://circleci.com/gh/JorgenVatle/feathers-factory)

## Installation
```bash
npm install --save-dev feathers-factory
```

## Example Usage
Feathers Factory provides an easy way define data generation templates for testing Feathers services. This works 
really nicely together with a mock data generator like [faker](https://github.com/faker-js/faker).

### Create a factory
Just new up the Feathers Factory class, provide your Feathers service, and a "Generator" object which defines what 
values should be inserted into your service when the factory is called.

##### Define and export a factory for your tests
```ts
// ./tests/Factories.ts
import FeathersApp from '../src/App'
import { Factory } from 'feathers-factory';

export const UserFactory = new Factory(FeathersApp.service('users'), {
    username: () => Faker.internet.userName(),
});
```

Types for the factory are inferred from the Feathers service you provide. 
It's fairly strict by design, so it may give you some issues depending on how your service is defined. See [Overriding 
inferred types](#overriding-service-types) for more info on work around this.

##### Import and use your factory
```ts
// ./tests/services/users.test.ts
import { UserFactory } from '../../Factories';
import FeathersApp from '../../../src/App';

describe('Users', () => {
    const service = FeathersApp.service('users');
    
    it('can be removed', async () => {
        const user = await UserFactory.create(); // { _id: "507f191e810c19729de860ea", username: "Damaris8" }
    
        await expect(service.get(user._id)).resolves.toHaveProperty('_id', user._id);
        
        await service.remove(user._id)
        
        await expect(service.get(user._id)).rejects.toBeInstanceOf(NotFound);
    })
})
```


### Advanced usage

#### Use promises and other factories
You're not limited to functions and static data! The following will create a full-fledged user for your post.
This can be super handy when dealing with a lot of relational data.
```js
Factory.define('post', FeathersApp.service('/posts'), {
    
    // You can use promises
    async content() {
        const response = await Axios.get('https://jsonplaceholder.typicode.com/posts');
        return response[0].body;
    },
    
    // Depend on a relationship? No problem! Define a `user` factory and:
    async userId() {
        return (await Factory.create('user'))._id;
    }
    
});
```

#### Override properties
Override factory data that would otherwise need to be generated. The content object will still be generated as we're
not specifying a substitute in the below overrides.
```js
const createPost = async () => {
    const myUser = await FeathersApp.service('/users').get('507f191e810c19729de860ea');
    
    Factory.create('post', {
        // Override the userId that would normally create a user per the example above.
        userId: myUser._id,
        
        // You can also add extra data:
        slug: Faker.lorem.slug,
    })
}
```

#### Setting default service `create()` params
You can assign default [`create()` params](https://docs.feathersjs.com/api/services#createdata-params). Handy if your Feathers service hooks rely on a [`route`](https://docs.feathersjs.com/api/hooks.html#contextparams) object for handling the `create()` requests fired by Feathers-Factory.
```js
Factory.define('comment', {
    message: Faker.lorem.sentence,
    async userId() {
        return (await Factory.create('user'))._id
    },
}, {
    async route() {
        return {
            postSlug: (await Factory.create('post')).slug
        }
    }
});
```

#### Overriding service `create()` params
You can override default service `create` params. It's worth noting that merging with defaults only goes one level deep.
```js
const createComment = async () => {
    const post = await createPost();
    
    Factory.create('comment', {}, { route: { postSlug: post.slug } })
};
```

#### Creating multiple entries
You can create multiple database entries using the `createMany()` method.
```js
Factory.createMany(1337, 'user', { name: 'overridden-name' }, { some: 'params' })
```

#### Only fetch data
You can resolve the factory data _without_ inserting it into the database using the Factory `get()` method.
```js
const randomUserData = async () => {
    const user = await Factory.get('user', { name: 'overridden-name' });
    console.log(user) // -> { _id: "507f191e810c19729de860ea", email: "steve@example.com", name: "overridden-name" }
}
```

#### Fetch data from factory
You can even use `this` to fetch the _result_ of your factory methods. Notice `merchantId` is accessed as if it was a 
property. See [clues.js](https://www.npmjs.com/package/clues) for more info on how this works.
```js
Factory.create('order', {
    email: Faker.internet.email,
    async merchantId() {
        return (await Factory.create('merchant'))._id;
    },
    async productId() {
        return (await Factory.create('product', { merchantId: await this.merchantId }))
    } 
})
``` 

### Define a global factory
Type inference here is not as good as with the module exports approach. But can be a good fallback if the schema
provided by your Feathers service is giving you type issues. It's also pretty handy if you're working in a
non-TypeScript environment.
```js
import Factory from 'feathers-factory';

Factory.define('my-factory', FeathersApp.service('service-to-mock-for'), {
    
    // Define dynamic data. Perfect with Faker.
    email() {
        return Faker.internet.email();
    },
    
    // Or just define static data.
    servicePlan: 'free',
    
});
```

Run the factory anywhere you need to mock a database entry with random data:
```js
export default async (FeathersApp) => {
    const user = await Factory.create('my-factory');
    
    console.log(user); 
    // -> { _id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", servicePlan: "free" }
    
    await FeathersApp.get(user._id)
    // -> { _id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", servicePlan: "free" }
};
```


### How does it work?
Pretty simple - any property, function, method, promise, etc you define in the factory specification is resolved
whenever you call `Factory.create()`, keeping your object structure, but using resolved data.

(E.g. `{ foo: () => 'bar') }` -> `{ foo: 'bar' }`)

The resolved data is then passed directly into your 
[Feathers service](https://crow.docs.feathersjs.com/guides/basics/services.html#service-methods) through its 
`create()` method.

## Credit
Thanks to [clues.js](https://www.npmjs.com/package/clues) for providing an excellent library for resolving in-object data.

## License
This repository is licensed under the ISC license.

Copyright (c) 2019, Jørgen Vatle.
