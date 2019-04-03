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
            selfReference() {
                const properties = [this.property, this.function, this.method, this.getter, this.async];
                const okProperties = properties.filter((value) => value === 'ok');

                return properties.length === okProperties.length ? 'ok' : 'error';
            }
        });
    });

    it('can create() defined factories', async () => {
        const entry = await FeathersFactory.create('test');
        await Expect(service.get(entry.id)).resolves.toBeTruthy();
    });

    it('can override data within predefined factories', async () => {
        const entry = await FeathersFactory.create('test', {
            method: 'overridden',
        });
        const dbEntry = await service.get(entry.id);

        Expect(entry.method).toBe('overridden');
        Expect(dbEntry.method).toBe('overridden');
    })

});