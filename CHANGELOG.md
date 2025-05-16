# feathers-factory

## 5.0.0-beta.2

### Minor Changes

- c2ef1e9: Add types for accessing deeply nested template properties using object dot notation

## 5.0.0-beta.1

### Minor Changes

- 7aa9357: Refactor internal data generator to be less complex and open up for usage outside a factory context.

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
  import { FactoryTemplate } from "feathers-factory";

  const shopTemplate = new FactoryTemplate({
    products: () => [productTemplate.resolve()],
    createdAt: () => new Date(),
  });

  const productTemplate = new FactoryTemplate({
    _id: () => faker.random.uuid(),
    shop: () => shopTemplate.resolve(),
  });

  const orderTemplate = new FactoryTemplate({
    shop: () => shopTemplate.resolve(),

    // These will only resolve once to the result of the above shop property
    createdAt: (ctx) => faker.date.dateAfter(ctx.get("shop.createdAt")),
    products: (ctx) => [ctx.get("shop.products.0")],

    relatedOffers: (ctx) => [
      ctx.call("shop"), // Creates a new shop and products
      ctx.call("shop"), // And yet another shop
    ],
  });
  ```

  ### Use with factories

  Factory templates can optionally be passed directly to the factories you define.

  ```ts
  // import orderTemplate from 'example above ⇡'
  import { Factory } from "feathers-factory";

  const orderFactory = new Factory(app.service("/orders"), orderTemplate);
  ```

  ### Optional typings for GlobalFactories

  You can now optionally add strict factory types for globally defined factories.

  ```ts
  // import orderFactory from 'example above ⇡'
  import { GlobalFactories } from "feathers-factory";

  GlobalFactories.define("order", orderFactory);

  declare module "feathers-factory" {
    interface GlobalFactories {
      orders: typeof orderFactory;
    }
  }

  GlobalFactories.create("order");
  // -> { shop: {...}, createdAt: Date, .... }
  ```

## 5.0.0-beta.0

### Major Changes

- 152e834: Improved compatability and type inference with non-standard-feathers services.

  - Factories are no longer tied to just Feathers services. Just supply an object with a `create()` method in place
    of the service.

  ```ts
  import Factory from "./Factory";

  const customFactory = new Factory({
    /**
     * Types will be inferred from this data argument.
     */
    create(data: { _id: string; username: string }) {
      // ...
    },
  });
  ```

  ## Breaking changes

  The runtime behavior is not much different from prior versions. However the `this` type for factories has been revamped
  to expose contextual properties using a `this.get(propName)` signature instead.

  ### Feathers Factory v4

  ```ts
  new Factory(UserService, {
    firstName: faker.person.firstName,
    lastName: faker.person.lastName,
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  });
  ```

  ### Feathers Factory v5

  You can still access properties using `this.firstName` - though they are omitted from your `this` type to encourage
  the use of the helper method instead.

  This change should make it more clear which properties depend on each other and whether they're available
  only asynchronously.

  ```ts
  new Factory(UserService, {
    firstName: faker.person.firstName,
    lastName: faker.person.lastName,
    fullName() {
      return `${this.get("firstName")} ${this.get("lastName")}`;
    },
  });
  ```
