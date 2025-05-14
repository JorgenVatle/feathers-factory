---
"feathers-factory": major
---

Improved compatability and type inference with non-standard-feathers services.

- Factories are no longer tied to just Feathers services. Just supply an object with a `create()` method in place
of the service.

```ts
import Factory from './Factory';

const customFactory = new Factory({
    /**
     * Types will be inferred from this data argument.
     */
    create(data: { _id: string, username: string }) {
        // ...
    }
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
        return `${this.firstName} ${this.lastName}`
    }
})
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
        return `${this.get('firstName')} ${this.get('lastName')}`
    }
})
```