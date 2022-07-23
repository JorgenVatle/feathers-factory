# Feathers Factory
A dead easy way to mock data for testing your [Feathers](https://feathersjs.com/) services. Heavily inspired by 
[Meteor Factory](https://github.com/versolearning/meteor-factory)

[![Tests](https://github.com/JorgenVatle/feathers-factory/actions/workflows/test.yml/badge.svg)](https://github.com/JorgenVatle/feathers-factory/actions)
[![Downloads](https://img.shields.io/npm/dt/feathers-factory.svg)](https://www.npmjs.com/package/feathers-factory)
[![Version](https://img.shields.io/npm/v/feathers-factory.svg)](https://www.npmjs.com/package/feathers-factory)

## Installation
```bash
npm install --save-dev feathers-factory
```

## Example Usage
Feathers Factory provides an easy way define data generation templates for testing Feathers services. This works 
really nicely together with a mock data generator like [faker](https://github.com/faker-js/faker).

### Define and export a factory for your tests
Just new up the Feathers Factory class, provide your Feathers service, and a "Generator" object which defines what
values should be inserted into your service when the factory is called.
```ts
// ./tests/Factories.ts
import FeathersApp from '../src/App'
import { Factory } from 'feathers-factory';

export const UserFactory = new Factory(FeathersApp.service('users'), {
    username: () => Faker.internet.userName(),
    membership: 'bronze'
});
```

Types for the factory are inferred from the Feathers service you provide. 
It's fairly strict by design, so it may give you some issues depending on how your service is defined. See [Global 
Factories](#define-a-global-factory) for more info on how to work around this.

### Import and use your factory
```ts
// ./tests/services/users.test.ts
import { UserFactory } from '../../Factories';
import FeathersApp from '../../../src/App';

describe('Users', () => {
    const service = FeathersApp.service('users');
    
    it('can be removed', async () => {
        const user = await UserFactory.create(); 
        // { _id: "507f191e810c19729de860ea", username: "Damaris8", membership: "bronze" }
    
        await expect(service.get(user._id)).resolves.toHaveProperty('_id', user._id);
        
        await service.remove(user._id)
        
        await expect(service.get(user._id)).rejects.toBeInstanceOf(NotFound);
    })
})
```


## Advanced usage

### Use promises and other factories
You're not limited to functions and static data! Your factories can call on other factories to ensure there any 
relational data is also created for your service.
```js

export const CommentFactory = new Factory(FeathersApp.service('/posts/comments'), {
    // You can use promises
    async content() {
        const response = await Axios.get('https://jsonplaceholder.typicode.com/posts/1/comments');
        return response[0].body;
    },

    // Service depends on a relationship? No problem! Define a `user` factory and call it:
    async userId() {
        return (await Factory.create('user'))._id;
    }
})  
```

### Override properties
You don't need to create a whole new factory if you just need to override one bit of data for a test.
For example, if you want to test against comments left by a user with "Gold" membership for example.
```js
const goldUser = await UserFactory.create({ membership: 'gold' });
// { _id: "00000020f51bb4362eee2a4d", username: "Eliseo2", membership: "gold" }

const commentByGoldUser = await CommentFactory.create({
    userId: goldUser._id,
})
// { _id: "507f191e810c19729de860ea", "userId": "00000020f51bb4362eee2a4d", content: "lorem ipsum..." }
```

### Use a property from the current factory
Using `this`, you can reference properties from the factory _result_. All properties are promises, so you may 
need to `await` the property if you're going to modify it.

This can be particularly if your service depends on relational data belonging to the same entity.
```ts
export const OrderFactory = new Factory(FeathersApp.service('/merchant/orders'), {
    customerEmail: () => Faker.internet.email(),
    async merchantId() {
        const merchant = await MerchantFactory.create();
        return merchant._id;
    },
    async productId() {
        const merchantId = await this.merchantId;
        const product = await ProductFactory.create();
        return product._id;
    }
})
```
See [clues.js](https://www.npmjs.com/package/clues) for more details on how this works.

### Setting default service `create()` params
You can assign default [`create()` params](https://docs.feathersjs.com/api/services#createdata-params). Handy if your
Feathers service hooks rely on some Hook [`context`](https://docs.feathersjs.com/api/hooks.html#contextparams) 
params for handling the `create()` requests fired by Feathers-Factory.
```js
export const CommentFacoryWithSlugs = new Factory(FeathersApp.service('/posts/comments'), {
    message: Faker.lorem.sentence,
    async userId() {
        return (await UserFactory.create())._id
    },
}, {
    async query() {
        return {
            postSlug: (await PostFactory.create()).slug
        }
    }
})
```

### Overriding params for a one-off `create()` call
You can override default service `create` params. It's worth noting that merging with defaults only goes one level deep.
```js
const SpecialComment = await CommentFactoryWithSlugs.create({}, {
    query: {
        postSlug: 'foo-bar'
    }
});
```

### Creating multiple entries
You can create multiple database entries using the `createMany()` method. Handy if you need to generate a lot of 
data for a particular service.
```js
await CommentFactoryWithSlugs.createMany(1337, {}, {
    query: {
        postSlug: 'foo-bar'
    }
});
```

### Only fetch data
You can resolve the factory data _without_ inserting it into the database using the Factory `get()` method.
```js
await UserFactory.get({ username: 'phantom-user99' });
// { username: "phantom-user99", membership: "bronze" }
```

### Prepare factory result, but don't insert it into the service
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

## Alternative usage
### Define a global factory
Type inference here is not as good as with explicitly exported Factory modules. But can be a good fallback if the schema
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


## How does it work?
Pretty simple - any property, function, method or promise you define in the factory specification is resolved
whenever you call `Factory.create()`, keeping your object structure, but using the return type of all properties 
within your factory.

For example, a factory generator like the following 
```ts
{ 
    foo: () => 'bar'
    hello: async () => 'world'
    someNumber: 22
}
```
Resolves to:
```ts
{ foo: 'bar', hello: 'world', someNumber: 22 }
```

The resolved data is then passed directly into your 
[Feathers service](https://crow.docs.feathersjs.com/guides/basics/services.html#service-methods) through its 
`create()` method.

## Credit
Thanks to [clues.js](https://www.npmjs.com/package/clues) for providing an excellent library for resolving in-object data.

## License
This repository is licensed under the ISC license.

Copyright (c) 2019, Jørgen Vatle.
