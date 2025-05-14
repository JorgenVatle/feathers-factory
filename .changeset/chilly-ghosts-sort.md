---
"feathers-factory": minor
---

Improve compatability and type inference with non-standard-feathers services.

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
