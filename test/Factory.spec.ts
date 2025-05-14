import { faker, simpleFaker } from '@faker-js/faker';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { Factory, type FactoryService } from '../src';

describe('Factory', () => {
    const factory = new Factory(userService, {
        _id: () => simpleFaker.string.uuid(),
        firstName: () => faker.person.firstName(),
        lastName: () => faker.person.lastName(),
        async email() {
            return faker.internet.email({
                firstName: await this.get('firstName'),
                lastName: await this.get('lastName'),
            });
        },
        async fullName() {
            return `${await this.get('firstName')} ${await this.get('lastName')}`;
        },
    });
    
    const _id = vi.spyOn(simpleFaker.string, 'uuid');
    const firstName = vi.spyOn(faker.person, 'firstName');
    const lastName = vi.spyOn(faker.person, 'lastName');
    const email = vi.spyOn(faker.internet, 'email');
    
    afterEach(() => {
        vi.resetAllMocks();
    });
    
    afterAll(() => {
        vi.restoreAllMocks();
    });
    
    describe('generator functions', () => {
        
        it('can be spied on', async () => {
            await factory.create();
            expect(_id).toHaveBeenCalled();
            expect(firstName).toHaveBeenCalled();
            expect(lastName).toHaveBeenCalled();
            expect(email).toHaveBeenCalled();
        })
        
        
        it(`only get called once even when referenced in other properties`, async () => {
            await factory.create();
            expect.soft(_id).toHaveBeenCalledOnce();
            expect.soft(firstName).toHaveBeenCalledOnce();
            expect.soft(lastName).toHaveBeenCalledOnce();
            expect.soft(email).toHaveBeenCalledOnce();
        })
        
        it('has the expected output format', async () =>{
            const result = await factory.create()
            expect(result).toEqual(
                expect.objectContaining({
                    _id: expect.any(String),
                    firstName: expect.any(String),
                    lastName: expect.any(String),
                    email: expect.stringContaining('@'),
                    fullName: expect.stringContaining(result.firstName),
                })
            );
        })
    })
    
    describe('overrides', () => {
        
        it('uses the provided overrides', async () => {
            const firstName = 'John M.'
            const result = await factory.create({
                firstName,
            });
            
            expect(result).toEqual(
                expect.objectContaining({
                    firstName: expect.stringMatching(firstName),
                })
            )
        })
        
        it('does not call original generator functions', async () => {
            await factory.create({
                lastName: 'Doe'
            })
            expect(lastName).not.toHaveBeenCalled();
        })
        
    })
    
    describe('self referencing', () => {
        const userFactory2 = new Factory(userService, {
            _id: () => simpleFaker.string.uuid(),
            email: () => faker.internet.email({}),
            async fullName() {
                return `${await this.get('firstName')} ${await this.get('lastName')}`;
            },
            firstName: () => faker.person.firstName(),
            lastName: () => faker.person.lastName(),
        });
        
        it('does not matter which order properties are defined in', async () => {
            const result = await factory.create();
            const result2 = await userFactory2.create();
            
            expect(result.fullName).toContain(result.firstName);
            expect(result.fullName).toContain(result.lastName);
            expect(result2.fullName).toContain(result2.firstName);
            expect(result2.fullName).toContain(result2.lastName);
        })
    })
});


function createService<TInput, TOutput = TInput>(): FactoryService<TInput, TOutput> {
    return {
        create(result: any) {
            console.debug(result);
            return result;
        }
    }
}

const userService = createService<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
}>();
