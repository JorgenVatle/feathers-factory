---
"feathers-factory": minor
---

Add `extend` and `unsafeExtend` methods to Factories, and improved TSDocs. 

- Added `Factory.extend()` - creates a new factory class with the same expected input and output types from the underlying service.
- Added `Factory.unsafeExtend()` - creates a new factory class where the input/output types of the service can be overriden to provide values not otherwise allowed by the service's create() method.
- Added and expanded TSDocs for `Factory`, `FactoryTemplate` and `TemplateContext` methods.
- Renamed `Factory.get()` to `Factory.resolve()` to be more in line with the signatures used in the rest of the library.
- Renamed `TemplateSchemaOverrides` type helper to `SchemaOverrides` to avoid unnecessary verboseness.
- Renamed `ResolveSchemaOutput` and `SchemaFieldValue` type helpers to simply `ResolveSchema` and `ResolveField` respectively. These helpers are primarily internal, though are exported as they may be useful in some use cases. 
- Changed `InferOutput` type helper to work with any input type so it is less finicky to use.
- Included internal FeathersFactoryError classes in package exports.
