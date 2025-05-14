import { faker } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import { FactoryDataGenerator } from './FactoryDataGenerator';

describe('FactoryDataGenerator', () => {
    const generator = new FactoryDataGenerator({
        fullName: function() {
            return `${this.get('firstName')} ${this.get('lastName')}`;
        },
        summary: function() {
            return `${this.get('firstName')} ${this.get('lastName')} (Tel: ${this.get('phoneNumber')})`;
        },
        firstName: () => faker.person.firstName(),
        lastName: () => faker.person.lastName(),
        phoneNumber: () => faker.phone.number(),
    });
    
    it('can resolve data', async () => {
        const result = await generator.resolve();
        expect(result).toHaveProperty('fullName');
        expect(result).toHaveProperty('lastName');
    })
    
})