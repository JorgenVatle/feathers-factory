---
"feathers-factory": minor
---

Add extendable `_create()` method to Factory class to allow for custom error handling.

- Make `params` optional in `Factory.extend()` method to match the Factory constructor signature. 
- Fix type issue where `Factory.unsafeExtend()` output types would be partially resolved. Yielding methods and functions when calling `create()`  