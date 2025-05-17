---
"feathers-factory": minor
---

Omit confusing internal type for unwrapping FactoryTemplate schemas as it would un-intuitively not work with
`FactoryTemplate` class instance types. A new type that will work with both has been added in its place.
