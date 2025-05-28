---
"feathers-factory": patch
---

Add missing exports for ExtendSchema and ResolveField helper types.

- Implemented type narrowing for overrides provided to FactoryTemplate's `resolve()` method. Fixes issues where 
optional types remain optional even when the provided overrides invalidate that type. 