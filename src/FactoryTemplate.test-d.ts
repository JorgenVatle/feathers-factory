import { describe, expectTypeOf, it } from 'vitest';
import { FactoryTemplate } from './FactoryTemplate';

describe('FactoryTemplate', () => {
    
    
    const template = new FactoryTemplate({
        _id: () => 1,
        createdAt: () => new Date(),
        firstName: 'test',
        lastName: 'test',
    });
    
    describe('Resolved data types', async () => {
        const resolvedTemplate = await template.resolve();
        
        it('will unwrap functions to their return values', async () => {
            expectTypeOf(resolvedTemplate._id).toEqualTypeOf<number>();
            expectTypeOf(resolvedTemplate.createdAt).toEqualTypeOf<Date>();
        });
        
        it('will not unwrap non-function values', async () => {
            expectTypeOf(resolvedTemplate.firstName).toEqualTypeOf<string>();
            expectTypeOf(resolvedTemplate.lastName).toEqualTypeOf<string>();
        })
        
    })
    
    describe('Overrides', () => {
        
        it('allows partial overrides', async () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                firstName: 'newFirstName',
            });
        })
        
        it('allows overriding functions with static values', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                createdAt: new Date(),
            });
            
            expectTypeOf(template.resolve).toBeCallableWith({
                _id: 5,
            });
        })
        
        it('has to adhere to the original schema', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                // @ts-expect-error
                _id: () => 'INVALID_ID',
                
                // @ts-expect-error
                firstName: 1,
            })
            
        })
        
        it('allows overriding static fields with functions', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                firstName: () => 'some other name',
            });
        });
        
        it.todo('does not allow unknown fields', () => {
            expectTypeOf(template.resolve).toBeCallableWith({
                // @ts-expect-error
                unknownField: 'test',
            });
        })
        
    })
    
    describe('Internal context', () => {
        it('can reference sibling fields in the same template', async () => {
            const template = new FactoryTemplate({
                firstName: 'test',
                lastName: 'test',
                age: (): number => 50,
                async fullName() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                },
            });
        })
        
        it('is accessible within resolver overrides', async () => {
            const template = new FactoryTemplate({
                firstName: 'test',
                lastName: 'test',
                age: (): number => 50,
                fullName: () => 'test',
            });
            
            await template.resolve({
                async fullName() {
                    expectTypeOf(await this.get('firstName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('lastName')).toEqualTypeOf<string>();
                    expectTypeOf(await this.get('age')).toEqualTypeOf<number>();
                    return 'test';
                },
            })
        })
    })
    
})