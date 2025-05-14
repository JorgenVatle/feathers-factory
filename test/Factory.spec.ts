import { faker, simpleFaker } from '@faker-js/faker';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { Factory, type FactoryService } from '../src';

describe('Factory', () => {
    const factory = new Factory(userService, {
        _id: () => simpleFaker.string.uuid(),
        firstName: () => faker.person.firstName(),
        lastName: () => faker.person.lastName(),
        email() {
            return faker.internet.email({
                firstName: this.firstName,
                lastName: this.lastName,
            });
        },
        fullName() {
            return `${this.firstName} ${this.lastName}`;
        },
    });
    
    describe('generator functions', () => {
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
        
    })
});


function createService<TInput, TOutput = TInput>(): FactoryService<TInput, TOutput> {
    const data: TOutput[] = [];
    return {
        create(result: any) {
            data.push(result);
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
