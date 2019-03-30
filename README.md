# Feathers Factory
A dead easy way to mock data for testing your [Feathers](https://feathersjs.com/) services. Heavily inspired by 
[Meteor Factory](https://github.com/versolearning/meteor-factory)

## Installation
```bash
npm install feathers-factory
```

## Usage
Define factories for the services you want to mock data for. This works well with 
[faker](https://www.npmjs.com/package/faker), allowing you to generate random data for every factory run.

### Basic usage
Define a factory:
```js
import FeathersFactory from 'feathers-factory';

FeathersFactory.define('my-factory', FeathersApp.service('service-to-mock-for'), {
    
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
    const user = await FeathersFactory.create('my-factory');
    
    console.log(user); // -> { id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", servicePlan: "free" }
    
    await FeathersApp.get(user.id) // -> { id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", servicePlan: "free" }
};
```

### Advanced usage

#### Use promises and other factories
You're not limited to functions and static data! The following will create a full-fledged user for your post.
This can be super handy when dealing with a lot of relational data.
```js
FeathersFactory.define('post', FeathersApp.service('/posts'), {
    
    // You can use promises
    async content() {
        const response = await Axios.get('https://jsonplaceholder.typicode.com/posts');
        return response[0].body;
    },
    
    // Depend on a relationship? No problem! Define a `user` factory and:
    async userId() {
        return (await FeathersFactory.create('user')).id;
    }
    
});
```

#### Override properties
Override factory data that would otherwise need to be generated. The content object will still be generated as we're
not specifying a substitute in the below overrides.
```js
const createPost = async () => {
    const myUser = await FeathersApp.service('/users').get('507f191e810c19729de860ea');
    
    FeathersFactory.create('post', {
        // Override the userId that would normally create a user per the example above.
        userId: myUser.id,
        
        // You can also add extra data:
        slug: Faker.lorem.slug,
    })
}
```

#### Setting default service `create()` params
You can assign default create params. Handy if your service hook relies on a `route` object.
```js
FeathersFactory.define('comment', {
    message: Faker.lorem.sentence,
    async userId() {
        return (await FeathersFactory.create('user'))._id
    },
}, {
    async route() {
        return {
            postSlug: (await FeathersFactory.create('post')).slug
        }
    }
});
```

#### Overriding service `create()` params
You can override default service `create` params. It's worth noting that merging with defaults only goes one level deep.
```js
const createComment = async () => {
    const post = await createPost();
    
    FeathersFactory.create('comment', {}, { route: { postSlug: post.slug } })
};
```

#### Creating multiple entries
You can create multiple database entries using the `createMany()` method.
```js
FeathersFactory.createMany(1337, 'user', { name: 'overridden-name' }, { some: 'params' })
```


### How does it work?
Pretty simple - any property, function, method, promise, etc you define in the factory specification is resolved
whenever you call `FeathersFactory.create()`, keeping your object structure, but using resolved data.

(E.g. `{ foo: () => 'bar') }` -> `{ foo: 'bar' }`)

The resolved data is then passed directly into your 
[Feathers service](https://crow.docs.feathersjs.com/guides/basics/services.html#service-methods) through its 
`create()` method.

## Credit
Thanks to [clues.js](https://www.npmjs.com/package/clues) for providing an excellent library for resolving in-object data.

## License
This repository is licensed under the ISC license.

Copyright (c) 2019, Jørgen Vatle.