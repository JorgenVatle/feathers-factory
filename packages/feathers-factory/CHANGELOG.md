# feathers-factory

## 5.1.0-beta.5

### Patch Changes

- 56777a3: Fix issue where extending an existing Factory instance would only include the provided overrides in the resulting template

## 5.1.0-beta.4

### Patch Changes

- ca75259: Fix issue where optional properties (`{ optional?: true }`) in SchemaOverrides would not be narrowed correctly.
- 4e8403b: Fix issue where exceptions during schema context resolve loses stack trackes.

## 5.1.0-beta.3

### Patch Changes

- f015dea: Add missing exports for ExtendSchema and ResolveField helper types.

  - Implemented type narrowing for overrides provided to FactoryTemplate's `resolve()` method. Fixes issues where
    optional types remain optional even when the provided overrides invalidate that type.

## 5.1.0-beta.2

### Minor Changes

- 43c30d2: Add extendable `_create()` method to Factory class to allow for custom error handling.

  - Make `params` optional in `Factory.extend()` method to match the Factory constructor signature.
  - Fix type issue where `Factory.unsafeExtend()` output types would be partially resolved. Yielding methods and functions when calling `create()`
  - Added `ExtendSchema` helper type for appending new fields/types on an existing template schema.

## 5.1.0-beta.1

### Minor Changes

- 1dd3b37: Add `extend` and `unsafeExtend` methods to Factories, and improved TSDocs.

  - Added `Factory.extend()` - creates a new factory class with the same expected input and output types from the underlying service.
  - Added `Factory.unsafeExtend()` - creates a new factory class where the input/output types of the service can be overriden to provide values not otherwise allowed by the service's create() method.
  - Added and expanded TSDocs for `Factory`, `FactoryTemplate` and `TemplateContext` methods.
  - Renamed `Factory.get()` to `Factory.resolve()` to be more in line with the signatures used in the rest of the library.
  - Renamed `TemplateSchemaOverrides` type helper to `SchemaOverrides` to avoid unnecessary verboseness.
  - Renamed `ResolveSchemaOutput` and `SchemaFieldValue` type helpers to simply `ResolveSchema` and `ResolveField` respectively. These helpers are primarily internal, though are exported as they may be useful in some use cases.
  - Changed `InferOutput` type helper to work with any input type so it is less finicky to use.
  - Simplified type hints for `FactoryTemplate.resolve()` and `FactoryTemplate.extend()` method parameters and resulting output.
  - Improved readability of resulting type hints originating from the `InferOutput` type helper.
  - Included internal FeathersFactoryError classes in package exports.
