# Feathers Factory
A dead easy way to mock data for your Feathers services.

## Installation
```bash
npm install feathers-generator
```

## Usage

Define a factory for the service you want to mock data for. This works well with 
[faker](https://www.npmjs.com/package/faker), allowing you to generate random data for every factory run.
```js
import Faker from 'faker';
import FeathersFactory from 'feathers-factory';

FeathersFactory.define('my-factory', FeathersApp.service('service-to-mock-for'), {
    
    name: Faker.fake("{{name.firstName}} {{name.lastName}}"),
    
    // Functions are supported and recommended.
    email() {
        return Faker.internet.email();
    },
    
    // Promises are supported as well!
    async companyName() {
        return Faker.company.companyName();
    }
});
```

Run the factory anywhere:
```js
export default async (FeathersApp) => {
    const user = await FeathersFactory.create('my-factory');
    
    console.log(user); // -> { id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", companyName: "Acme Inc" }
    
    await FeathersApp.get(user.id) // -> { id: "507f191e810c19729de860ea", email: "Damaris8@yahoo.com", companyName: "Acme Inc" }
};
```

## License
This repository is licensed under the ISC license.

Copyright (c) 2019, Jørgen Vatle.