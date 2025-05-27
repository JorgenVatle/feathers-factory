---
"feathers-factory": minor
---

Add `extend` and `unsafeExtend` methods to Factory class.

- `Factory.extend()` - creates a new factory class with the same expected input and output types from the underlying service.
- `Factory.unsafeExtend()` - creates a new factory class where the input/output types of the service can be overriden to provide values not otherwise allowed by the service's create() method.
- Added and expanded TSDocs for `Factory`, `FactoryTemplate` and `TemplateContext` methods.

- `Factory.get()` - renamed to `Factory.resolve()` to be more in line with the signatures used in the rest of the library.
