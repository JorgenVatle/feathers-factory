# feathers-factory

## 5.1.0-beta.0

### Minor Changes

- 63dcd30: Omit confusing internal type for unwrapping FactoryTemplate schemas as it would un-intuitively not work with
  `FactoryTemplate` class instance types. A new type that will work with both has been added in its place.

  Fixed issue where the resolved type of `this.get()` would equate to unknown when referencing other dynamic methods.

## 5.0.1

### Patch Changes

- 7b70337: Fix type inference edge-cases with FactoryTemplate output and 'this' context with some async contexts.

## 5.0.0

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

### Minor Changes

- 2033f26: Infer service Params type from service type definition instead of relying on external Feathers Params type.
- 285e8f0: Add exports for internal schema and template merging utilities
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

- c2ef1e9: Add types for accessing deeply nested template properties using object dot notation

### Patch Changes

- 5bc6553: Add missing implementation for TemplateContext call() method
- cc64e9d: Move type-fest from devDependencies into dependencies to avoid missing types in peer projects.

## 5.0.0-beta.5

### Minor Changes

- 2033f26: Infer service Params type from service type definition instead of relying on external Feathers Params type.

## 5.0.0-beta.4

### Patch Changes

- 5bc6553: Add missing implementation for TemplateContext call() method

## 5.0.0-beta.3

### Patch Changes

- cc64e9d: Move type-fest from devDependencies into dependencies to avoid missing types in peer projects.

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
