import { Service } from '@feathersjs/feathers';
import Expect from 'expect';

import FeathersFactory from '../src/FeathersFactory';
import Feathers from './feathers';

let service: Service<any>;

before(() => {
    service = Feathers.service('/tests')
});

describe('Feathers Factory', () => {

    it('can define() factories', () => {
        FeathersFactory.define('test', service, {
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
        });
    });

    it('can create() defined factories', async () => {
        const entry = await FeathersFactory.create('test');
        await Expect(service.get(entry.id)).resolves.toBeTruthy();
    });

    it('can get() a factory\'s data.', async () => {
        const entry = await FeathersFactory.get('test');
        Expect(entry.selfReference).toBe('ok');
    });

    it('can createMany()', async () => {
        let count = 0;
        let quantity = 5;

        const entries = await FeathersFactory.createMany(quantity, 'test');

        await Promise.all(entries.map(async (entry) => {
            const dbEntry = await service.get(entry.id);
            Expect(dbEntry.selfReference).toBe('ok');
            count++;
        }));

        Expect(count).toBe(quantity);
    });

    it('can override data within predefined factories', async () => {
        const entry = await FeathersFactory.create('test', {
            method: 'overridden',
        });
        const dbEntry = await service.get(entry.id);

        Expect(entry.method).toBe('overridden');
        Expect(dbEntry.method).toBe('overridden');
    });

    it('resolves data as expected', async () => {
        const entry = await FeathersFactory.create('test');
        const dbEntry = await service.get(entry.id);

        const validateContent = (key: string) => {
            if (key === 'id') return;
            Expect(entry[key]).toBe('ok');
            Expect(dbEntry[key]).toBe('ok');
        };

        Object.keys(entry).map(validateContent);
        Object.keys(dbEntry).map(validateContent);
    });
});