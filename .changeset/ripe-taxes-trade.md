---
"feathers-factory": minor
---

Refactor internal data generator to be less complex and open up for usage outside a factory context.

- Replaced `DataGenerator` type with more extensible `FactoryTemplate` class.
- Added option to access the current resolver context through arrow functions.
- Added option to `call()` peer properties. This will bypass the current
context's cached result for a given property. Essentially re-running a function
to create more than one output for a given field.


### Factory Template
They work just like factories. Just that they are not tied to any underlying 
service schema and will only mock out structured data consistent within its
own context.

```ts
import { FactoryTemplate } from 'feathers-factory';

const shopTemplate = new FactoryTemplate({
    products: () => [productTemplate.resolve()],
    createdAt: () => new Date(),
});

const productTemplate = new FactoryTemplate({
    _id: () => faker.random.uuid(),
    shop: () => shopTemplate.resolve()
})

const orderTemplate = new FactoryTemplate({
    shop: () => shopTemplate.resolve(),
    
    // These will only resolve once to the result of the above shop property
    createdAt: (ctx) => faker.date.dateAfter(ctx.get('shop.createdAt')),
    products: (ctx) => [ctx.get('shop.products.0')], 
    
    relatedOffers: (ctx) => [
        ctx.call('shop'), // Creates a new shop and products
        ctx.call('shop'), // And yet another shop
    ] 
})
```

### Use with factories
Factory templates can optionally be passed directly to the factories you define.
```ts
// import orderTemplate from 'example above ⇡'
import { Factory } from 'feathers-factory'

const orderFactory = new Factory(app.service('/orders'), orderTemplate);
```

### Optional typings for GlobalFactories
You can now optionally add strict factory types for globally defined factories.

```ts
// import orderFactory from 'example above ⇡'
import { GlobalFactories } from 'feathers-factory';

GlobalFactories.define('order', orderFactory);

declare module 'feathers-factory' {
    interface GlobalFactories {
        'orders': typeof orderFactory
    }
}

GlobalFactories.create('order')
  // -> { shop: {...}, createdAt: Date, .... }
```