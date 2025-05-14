import { faker, simpleFaker } from '@faker-js/faker';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Factory, type FactoryService } from '../src';

function createService<TInput, TOutput = TInput>(): FactoryService<TInput, TOutput> {
    const data: TOutput[] = [];
    return {
        create(result: any) {
            data.push(result);
            return result;
        }
    }
}


describe('Factory', () => {
    const service = createService();
    const factory = new Factory(service, {
        _id: () => simpleFaker.string.uuid(),
        firstName: () => faker.person.firstName(),
        lastName: () => faker.person.lastName(),
        email() {
            return faker.internet.email({
                firstName: this.firstName,
                lastName: this.lastName,
            });
        },
    });
    
    const _id = vi.spyOn(simpleFaker.string, 'uuid');
    const firstName = vi.spyOn(faker.person, 'firstName');
    const lastName = vi.spyOn(faker.person, 'lastName');
    const email = vi.spyOn(faker.internet, 'email');
    
    afterEach(() => {
        vi.restoreAllMocks();
    })
    
    it('is able to spy on the factory functions', async () => {
        await factory.create();
        expect(_id).toHaveBeenCalled();
        expect(firstName).toHaveBeenCalled();
        expect(lastName).toHaveBeenCalled();
        expect(email).toHaveBeenCalled();
    })
    
    
    it('Does not call factory functions more than once', async () => {
        await factory.create();
        expect(_id).toHaveBeenCalledTimes(1);
        expect(firstName).toHaveBeenCalledTimes(1);
        expect(lastName).toHaveBeenCalledTimes(1);
        expect(email).toHaveBeenCalledTimes(1);
    })
    
    it('has the expected output format', async () =>{
        await expect(factory.create()).resolves.toEqual(
            expect.objectContaining({
                _id: expect.any(String),
                firstName: expect.any(String),
                lastName: expect.any(String),
                email: expect.any(String),
            })
        );
    })
})
