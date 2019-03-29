# Feathers Factory
A dead easy way to mock data for your [Feathers](https://feathersjs.com/) services. Heavily inspired by 
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
import Faker from 'faker';
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

Run the factory anywhere:
```js
export default async (FeathersApp) => {
    const user = await FeathersFactory.create('my-factory');
    
    console.log(user); // -> { id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", servicePlan: "free" }
    
    await FeathersApp.get(user.id) // -> { id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", servicePlan: "free" }
};
```

### Advanced usage
You're not just limited to functions and static data.
```js
FeathersFactory.define('posts', FeathersApp.service('/posts'), {
    
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
This will create a full-fledged user for your post. This can be super handy when dealing with a lot of relational data.

## License
This repository is licensed under the ISC license.

Copyright (c) 2019, Jørgen Vatle.