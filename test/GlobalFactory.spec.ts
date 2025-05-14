import { Service } from '@feathersjs/feathers';
import { beforeAll, describe, expect, it } from 'vitest';

import { Factory, GlobalFactories } from '../src';
import Feathers from './feathers/App';

let service: Service<any>;

beforeAll(() => {
    service = Feathers.service('/tests')
});

describe('Global Feathers Factory', () => {
    

    it('can define() factories', () => {
        const factory = new Factory({
            create(data: {
                id: string,
                property: string,
                method: string;
                function: string,
                getter: string,
                async: string,
                selfReference: string,
            }) {
                return data;
            }
        }, {
            id: () => process.hrtime().join('-'),
            property: 'ok',
            function: () => 'ok',
            method() { return 'ok' },
            get getter() { return 'ok' },
            async: async () => 'ok',
            async selfReference() {
                const properties = [this.property, this.function, this.method, this.getter, await this.async];
                const okProperties = properties.filter((value) => value === 'ok');
                
                return properties.length === okProperties.length ? 'ok' : 'error';
            }
        })
        GlobalFactories.define('test', service, {});
    });

    it('can create() defined factories', async () => {
        const entry = await GlobalFactories.create('test');
        await expect(service.get(entry.id)).resolves.toBeTruthy();
    });

    it('can get() a factory\'s data.', async () => {
        const entry = await GlobalFactories.get('test');
        expect(entry.selfReference).toBe('ok');
        await expect(service.get(entry.id)).rejects.toBeTruthy();
    });

    it('can createMany()', async () => {
        let count = 0;
        let quantity = 5;

        const entries = await GlobalFactories.createMany(quantity, 'test');

        await Promise.all(entries.map(async (entry) => {
            const dbEntry = await service.get(entry.id);
            expect(dbEntry.selfReference).toBe('ok');
            count++;
        }));

        expect(count).toBe(quantity);
    });

    it('can override data within predefined factories', async () => {
        const entry = await GlobalFactories.create('test', {
            method: 'overridden',
        });
        const dbEntry = await service.get(entry.id);

        expect(entry.method).toBe('overridden');
        expect(dbEntry.method).toBe('overridden');
    });

    it('resolves data as expected', async () => {
        const entry = await GlobalFactories.create('test');
        const dbEntry = await service.get(entry.id);

        const validateContent = (key: string) => {
            if (key === 'id') return;
            expect(entry[key]).toBe('ok');
            expect(dbEntry[key]).toBe('ok');
        };

        Object.keys(entry).map(validateContent);
        Object.keys(dbEntry).map(validateContent);
    });

});